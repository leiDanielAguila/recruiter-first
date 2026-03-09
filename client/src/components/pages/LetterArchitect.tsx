import { FileText } from 'lucide-react'

export function LetterArchitect() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8">
      <FileText className="w-16 h-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-semibold text-foreground mb-2">Letter Architect</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Create professional cover letters and correspondence. Coming soon.
      </p>
    </div>
  )
}
