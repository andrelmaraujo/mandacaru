"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { MissionCard } from "./mission-card"
import { MicroCanvas } from "./micro-canvas"

type Message = {
    id: number
    role: "user" | "agent"
    agentName?: string
    content?: string
    timestamp: string
    type: "text" | "mission" | "canvas"
    data?: any
}

export function ChatInterface() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            role: "agent",
            agentName: "Compadre",
            content: "Opa! Vi que você quer empreender. Me conta mais dessa ideia aí!",
            timestamp: new Date().toISOString(),
            type: "text"
        }
    ])
    const [input, setInput] = useState("")
    const [missionActive, setMissionActive] = useState(false)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const newMessage: Message = {
            id: messages.length + 1,
            role: "user",
            agentName: "Você",
            content: input,
            timestamp: new Date().toISOString(),
            type: "text"
        }

        setMessages(prev => [...prev, newMessage])
        setInput("")

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
            const response = await fetch(`${apiUrl}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [...messages, newMessage].map(m => ({
                        role: m.role,
                        content: m.content || ""
                    }))
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to fetch response")
            }

            const data = await response.json()

            // Add agent responses
            data.forEach((msg: any, index: number) => {
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: prev.length + 1,
                        role: "agent",
                        agentName: msg.agentName,
                        content: msg.content,
                        timestamp: new Date().toISOString(),
                        type: msg.type,
                        data: msg.data
                    }])

                    // If mission, activate it
                    if (msg.type === "mission") {
                        setMissionActive(true)
                    }
                    // If canvas, deactivate mission
                    if (msg.type === "canvas") {
                        setMissionActive(false)
                    }
                }, index * 1000) // Stagger responses
            })

        } catch (error) {
            console.error("Error sending message:", error)
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                role: "agent",
                agentName: "System",
                content: "Ocorreu um erro ao conectar com os agentes. Tente novamente.",
                timestamp: new Date().toISOString(),
                type: "text"
            }])
        }
    }

    const handleMissionComplete = () => {
        setMessages(prev => [...prev, {
            id: prev.length + 1,
            role: "user",
            agentName: "Você",
            content: "Completei a missão! O pessoal disse que...",
            timestamp: new Date().toISOString(),
            type: "text"
        }])
        // Trigger next step logic via handleSend effect or direct call
        setTimeout(() => {
            handleSend() // Re-use handleSend logic to trigger canvas
        }, 500)
    }

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto border-x border-border bg-background">
            <header className="p-4 border-b border-border bg-primary/10 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                <h1 className="font-bold text-lg text-primary">Mesa Redonda</h1>
                <div className="flex -space-x-2">
                    <Avatar className="border-2 border-background w-8 h-8">
                        <AvatarFallback className="bg-orange-500 text-white">C</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-background w-8 h-8">
                        <AvatarFallback className="bg-purple-600 text-white">X</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-background w-8 h-8">
                        <AvatarFallback className="bg-blue-500 text-white">A</AvatarFallback>
                    </Avatar>
                </div>
            </header>

            <ScrollArea className="flex-1 p-4 bg-muted/20">
                <div className="space-y-4 pb-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {msg.type === 'text' && (
                                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                    : 'bg-card border border-border rounded-tl-none'
                                    }`}>
                                    {msg.role === 'agent' && (
                                        <p className="text-xs font-bold mb-1 text-primary/80">{msg.agentName}</p>
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            )}

                            {msg.type === 'mission' && (
                                <div className="w-full max-w-[90%]">
                                    <MissionCard
                                        title={msg.data.title}
                                        description={msg.data.description}
                                        onComplete={handleMissionComplete}
                                    />
                                </div>
                            )}

                            {msg.type === 'canvas' && (
                                <div className="w-full max-w-[90%]">
                                    <MicroCanvas data={msg.data} />
                                </div>
                            )}

                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-background sticky bottom-0">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Digite sua resposta..."
                        className="flex-1 bg-muted/50"
                    />
                    <Button type="submit" className="bg-primary hover:bg-primary/90">Enviar</Button>
                </form>
            </div>
        </div>
    )
}
