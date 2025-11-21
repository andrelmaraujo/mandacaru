import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CanvasData {
    problem: string
    solution: string
    audience: string
    differential: string
}

interface MicroCanvasProps {
    data: CanvasData
}

export function MicroCanvas({ data }: MicroCanvasProps) {
    return (
        <Card className="w-full border-2 border-purple-500/50 bg-gradient-to-br from-background to-purple-50/10 dark:to-purple-950/10">
            <CardHeader className="text-center border-b border-border/50 pb-4">
                <CardTitle className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    Seu Negócio em 1 Card 🚀
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4">
                <div className="space-y-1">
                    <Badge variant="outline" className="border-red-400 text-red-500">Problema</Badge>
                    <p className="text-sm font-medium">{data.problem}</p>
                </div>

                <div className="space-y-1">
                    <Badge variant="outline" className="border-green-400 text-green-500">Solução</Badge>
                    <p className="text-sm font-medium">{data.solution}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Badge variant="outline" className="border-blue-400 text-blue-500">Público</Badge>
                        <p className="text-xs font-medium">{data.audience}</p>
                    </div>
                    <div className="space-y-1">
                        <Badge variant="outline" className="border-yellow-400 text-yellow-500">O Tchan</Badge>
                        <p className="text-xs font-medium">{data.differential}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
