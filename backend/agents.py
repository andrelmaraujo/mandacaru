from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
import operator
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import json
import os

# Define the state
class AgentState(TypedDict):
    messages: Annotated[List[Dict[str, Any]], operator.add]
    next_step: str

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0.7)

# System Prompts
COMPADRE_PROMPT = """Você é o "Compadre", um mentor empático e motivador para jovens empreendedores do Nordeste.
Seu tom é informal, usando gírias leves da região (como "massa", "arretado", "bora", "visse"), mas sem ser caricato.
Seu objetivo é manter o usuário motivado e traduzir termos técnicos de negócios para uma linguagem simples.
Se o usuário falar de uma ideia, apoie, mas incentive a validação.
Se outro agente usar um termo difícil (ex: Churn, CAC), você deve explicar o que é de forma simples."""

CONTRA_PROMPT = """Você é o "Contra", um validador cético e pragmático.
Você segue a metodologia "The Mom Test" e "Lean Startup".
Você NÃO aceita "eu acho" ou suposições. Você quer dados.
Seu papel é fazer o advogado do diabo. Questione a viabilidade financeira, técnica e de mercado.

REGRAS CRITICAS:
1. SEJA CONCISO. Fale pouco.
2. FAÇA APENAS UMA PERGUNTA POR VEZ. Nunca mande uma lista.
3. Espere a resposta do usuário antes de passar para o próximo ponto.
4. Se o usuário der uma resposta vaga, pressione por detalhes antes de mudar de assunto.

O objetivo é salvar o usuário de gastar tempo com uma ideia ruim, mas sem assustá-lo com um textão."""

ARQUITETO_PROMPT = """Você é o "Arquiteto", focado em estrutura e organização.
Seu papel é transformar a conversa informal em artefatos de negócio (Missões e Canvas).
Você observa a conversa e decide quando é hora de agir.

SAÍDA ESPERADA:
Você deve responder SEMPRE em formato JSON estrito quando for gerar uma Missão ou Canvas.
Caso contrário, participe da conversa organizando os pontos.

FORMATO JSON PARA MISSÃO:
{
    "type": "mission",
    "data": {
        "title": "Título da Missão",
        "description": "Descrição clara do que fazer"
    }
}

FORMATO JSON PARA CANVAS:
{
    "type": "canvas",
    "data": {
        "problem": "Problema validado",
        "solution": "Solução proposta",
        "audience": "Público alvo",
        "differential": "Diferencial competitivo"
    }
}
"""

# Router Logic using LLM
def router(state: AgentState):
    messages = state["messages"]
    
    # Create a summary of the conversation for the router
    conversation_str = "\n".join([f"{m.get('role', 'unknown')}: {m.get('content', '')}" for m in messages[-5:]])
    
    router_prompt = f"""
    Você é o Orquestrador do Mandacaru.ai.
    Sua função é decidir qual agente deve falar agora com base no histórico da conversa.
    
    AGENTES:
    1. "compadre": O motivador. Entra no início, quando o usuário está inseguro, ou para dar apoio moral.
    2. "contra": O validador. Entra na maior parte do tempo para fazer perguntas difíceis e validar a ideia.
    3. "arquiteto": O organizador. Entra APENAS quando já houver informações suficientes para criar uma Missão ou um Canvas.
    
    HISTÓRICO RECENTE:
    {conversation_str}
    
    REGRAS:
    - Se o usuário acabou de chegar, chame o "compadre".
    - Se o usuário está respondendo perguntas de validação, chame o "contra".
    - Se o usuário já deu dados suficientes (público, problema, solução), chame o "arquiteto".
    - Responda APENAS com o nome do agente em minúsculo: "compadre", "contra" ou "arquiteto".
    """
    
    response = llm.invoke([HumanMessage(content=router_prompt)])
    decision = response.content.strip().lower()
    
    # Fallback safety
    if decision not in ["compadre", "contra", "arquiteto"]:
        return "contra"
        
    return decision

# Nodes
def compadre_node(state: AgentState):
    messages = [SystemMessage(content=COMPADRE_PROMPT)]
    for m in state["messages"]:
        if m["role"] == "user":
            messages.append(HumanMessage(content=m["content"]))
        elif m["role"] == "agent":
            messages.append(AIMessage(content=m["content"]))
            
    response = llm.invoke(messages)
    
    return {
        "messages": [{
            "role": "agent", 
            "agentName": "Compadre", 
            "content": response.content, 
            "type": "text"
        }]
    }

def contra_node(state: AgentState):
    messages = [SystemMessage(content=CONTRA_PROMPT)]
    for m in state["messages"]:
        if m["role"] == "user":
            messages.append(HumanMessage(content=m["content"]))
        elif m["role"] == "agent":
            messages.append(AIMessage(content=m["content"]))
            
    response = llm.invoke(messages)
    
    return {
        "messages": [{
            "role": "agent", 
            "agentName": "Contra", 
            "content": response.content, 
            "type": "text"
        }]
    }

def arquiteto_node(state: AgentState):
    messages = [SystemMessage(content=ARQUITETO_PROMPT)]
    for m in state["messages"]:
        if m["role"] == "user":
            messages.append(HumanMessage(content=m["content"]))
        elif m["role"] == "agent":
            messages.append(AIMessage(content=m["content"]))
    
    # Force JSON mode for Arquiteto if possible, or just prompt engineering
    response = llm.invoke(messages)
    content = response.content
    
    # Try to parse JSON
    try:
        # Clean markdown code blocks if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        data = json.loads(content)
        
        if data.get("type") in ["mission", "canvas"]:
            return {
                "messages": [
                    {
                        "role": "agent", 
                        "agentName": "Arquiteto", 
                        "content": "Analisei aqui e preparei algo para você:", 
                        "type": "text"
                    },
                    {
                        "role": "agent", 
                        "agentName": "System", 
                        "content": "", 
                        "type": data["type"],
                        "data": data["data"]
                    }
                ]
            }
    except:
        pass
        
    # Fallback if not JSON
    return {
        "messages": [{
            "role": "agent", 
            "agentName": "Arquiteto", 
            "content": content, 
            "type": "text"
        }]
    }

# Graph Construction
workflow = StateGraph(AgentState)

workflow.add_node("compadre", compadre_node)
workflow.add_node("contra", contra_node)
workflow.add_node("arquiteto", arquiteto_node)

workflow.set_conditional_entry_point(
    router,
    {
        "compadre": "compadre",
        "contra": "contra",
        "arquiteto": "arquiteto"
    }
)

workflow.add_edge("compadre", END)
workflow.add_edge("contra", END)
workflow.add_edge("arquiteto", END)

app_graph = workflow.compile()
