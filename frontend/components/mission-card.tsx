import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface MissionCardProps {
    title: string
    description: string
    onComplete: () => void
}

export function MissionCard({ title, description, onComplete }: MissionCardProps) {
    return (
        <Card className="w-full border-2 border-orange-500/50 bg-orange-50/10 dark:bg-orange-950/10">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-orange-500" />
                    <CardTitle className="text-lg text-orange-600 dark:text-orange-400">Missão do Momento</CardTitle>
                </div>
                <CardDescription className="text-base font-medium text-foreground">
                    {title}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
            <CardFooter>
                <Button onClick={onComplete} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    Registrar Resposta
                </Button>
            </CardFooter>
        </Card>
    )
}
