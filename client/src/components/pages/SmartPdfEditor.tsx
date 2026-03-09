import { FileEdit } from 'lucide-react'

export function SmartPdfEditor() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8">
      <FileEdit className="w-16 h-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-semibold text-foreground mb-2">Smart PDF Editor</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Edit and enhance PDF documents with AI assistance. Coming soon.
      </p>
    </div>
  )
}
