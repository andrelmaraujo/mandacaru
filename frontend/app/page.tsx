import { OnboardingForm } from "@/components/onboarding-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md space-y-8 text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
          Mandacaru.ai 🌵
        </h1>
        <p className="text-xl text-muted-foreground">
          Da ideia vaga ao negócio validado.
        </p>
      </div>

      <OnboardingForm />

      <footer className="mt-12 text-sm text-muted-foreground text-center">
        <p>Feito com ❤️ no Nordeste</p>
      </footer>
    </main>
  )
}
