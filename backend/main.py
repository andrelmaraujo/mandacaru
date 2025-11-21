from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
import os
from dotenv import load_dotenv

# Load env vars
load_dotenv()

app = FastAPI(title="Mandacaru.ai API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    role: str
    agentName: str
    content: Optional[str] = None
    type: str = "text"
    data: Optional[Any] = None

@app.get("/")
async def root():
    return {"message": "Mandacaru.ai API is running 🌵"}

@app.post("/chat", response_model=List[ChatResponse])
async def chat(request: ChatRequest):
    from agents import app_graph
    
    # Convert request messages to dict format expected by graph
    graph_input = {
        "messages": [
            {"role": m.role, "content": m.content} for m in request.messages
        ]
    }
    
    # Run graph
    result = app_graph.invoke(graph_input)
    
    # Extract new messages (last ones added by agents)
    # In a real app we would filter better, here we just take the last ones
    # that are not from user
    
    all_messages = result["messages"]
    new_messages = []
    
    # Simple logic: get messages after the last user message
    # Or just return the last message if it's an agent
    
    last_msg = all_messages[-1]
    if last_msg.get("role") == "agent":
        # If the last message is a mission/canvas (from Arquiteto/System), it might be a list or separate messages
        # Our node returns a list of messages. LangGraph appends them.
        
        # Let's just return the last generated messages. 
        # Since we invoke with full history, we need to find what was added.
        # But for this MVP, let's just return the last 1 or 2 messages.
        
        # Actually, let's filter for messages that are NOT in the input
        input_len = len(request.messages)
        generated = all_messages[input_len:]
        
        for msg in generated:
            new_messages.append(ChatResponse(
                role=msg.get("role", "agent"),
                agentName=msg.get("agentName", "System"),
                content=msg.get("content", ""),
                type=msg.get("type", "text"),
                data=msg.get("data")
            ))
            
    return new_messages
