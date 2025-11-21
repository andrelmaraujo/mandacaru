"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function OnboardingForm() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: "",
        city: "",
        idea: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Save to local storage or context for now
        localStorage.setItem("mandacaru_user", JSON.stringify(formData))
        router.push("/chat")
    }

    return (
        <Card className="w-full max-w-md mx-auto border-2 border-primary/20 shadow-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-primary">Quem é você?</CardTitle>
                <CardDescription>
                    Pra gente começar, me diz um pouco sobre você e sua ideia.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Seu Nome (ou Apelido)</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ex: Mateus"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">De onde você fala?</Label>
                        <Input
                            id="city"
                            name="city"
                            placeholder="Ex: Recife, PE"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="idea">Qual é a sua ideia? (Resumida)</Label>
                        <Textarea
                            id="idea"
                            name="idea"
                            placeholder="Ex: Quero vender bolo de pote na faculdade..."
                            required
                            value={formData.idea}
                            onChange={handleChange}
                            className="bg-background/50 min-h-[100px]"
                        />
                    </div>
                    <Button type="submit" className="w-full text-lg font-semibold py-6">
                        Bora começar! 🚀
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
