import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, ChevronLeft, ChevronRight } from 'lucide-react'

const tips = [
  {
    heading: 'Tailor every application',
    body: 'Customize your resume for each job posting. Recruiters spend an average of 7 seconds scanning a resume — make those seconds count.',
  },
  {
    heading: 'Use measurable achievements',
    body: 'Replace vague duties with concrete results. "Increased sales by 30%" is far more compelling than "responsible for sales."',
  },
  {
    heading: 'Mirror the job description',
    body: 'Incorporate keywords from the job posting into your resume to pass ATS filters and signal alignment with the role.',
  },
  {
    heading: 'Keep it to one page (usually)',
    body: 'Unless you have 10+ years of experience, a single well-formatted page is typically more effective than two sparse ones.',
  },
  {
    heading: 'Lead with impact',
    body: 'Put your strongest, most relevant experience at the top. Recruiters read top-to-bottom, so front-load what matters most.',
  },
  {
    heading: 'Your summary is your pitch',
    body: 'A 2–3 sentence professional summary at the top gives context and hooks the reader before they dive into the details.',
  },
]

export function LoadingScreen() {
  const [currentTip, setCurrentTip] = useState(0)
  const [fade, setFade] = useState(true)

  const changeTip = (next: number) => {
    setFade(false)
    setTimeout(() => {
      setCurrentTip(next)
      setFade(true)
    }, 300)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      changeTip((prev) => (prev + 1) % tips.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handlePrev = () => changeTip((currentTip - 1 + tips.length) % tips.length)
  const handleNext = () => changeTip((currentTip + 1) % tips.length)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-lg border-[#262626]">
        <CardContent className="pt-10 pb-10">
          <div className="space-y-8">
            {/* Animated Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#262626] flex items-center justify-center animate-pulse">
                  <Brain className="w-10 h-10 text-[#F3F4F4]" />
                </div>
                <div className="absolute -inset-2 rounded-full border-2 border-[#262626] opacity-20 animate-ping" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground">Analyzing your resume…</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>

            {/* Tip Carousel */}
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground text-center">
                Tip while you wait
              </p>
              <div
                className="min-h-[80px] transition-opacity duration-300"
                style={{ opacity: fade ? 1 : 0 }}
              >
                <p className="font-medium text-sm text-center">{tips[currentTip].heading}</p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  {tips[currentTip].body}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePrev}
                  className="p-1 rounded-full hover:bg-[#F3F4F4] transition-colors"
                  aria-label="Previous tip"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="flex gap-1.5">
                  {tips.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => changeTip(i)}
                      aria-label={`Go to tip ${i + 1}`}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === currentTip ? 'bg-[#262626]' : 'bg-[#262626]/20'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="p-1 rounded-full hover:bg-[#F3F4F4] transition-colors"
                  aria-label="Next tip"
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
