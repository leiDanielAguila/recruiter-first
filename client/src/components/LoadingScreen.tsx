import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { FileText, Search, Brain, CheckCircle2 } from 'lucide-react'

const steps = [
  { icon: FileText, label: 'Analyzing resume' },
  { icon: Search, label: 'Matching requirements' },
  { icon: Brain, label: 'Evaluating fit' },
  { icon: CheckCircle2, label: 'Generating insights' },
]

export function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 1
      })
    }, 30)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const stepIndex = Math.floor((progress / 100) * steps.length)
    setCurrentStep(Math.min(stepIndex, steps.length - 1))
  }, [progress])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-lg border-[#262626]">
        <CardContent className="pt-8 pb-8">
          <div className="space-y-8">
            {/* Animated Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#262626] flex items-center justify-center animate-pulse">
                  {steps[currentStep] && (() => {
                    const Icon = steps[currentStep].icon
                    return <Icon className="w-10 h-10 text-[#F3F4F4]" />
                  })()}
                </div>
                <div className="absolute -inset-2 rounded-full border-2 border-[#262626] opacity-20 animate-ping" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <Progress value={progress} className="h-3" />
              <p className="text-center text-sm text-muted-foreground">
                {progress}% complete
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                
                return (
                  <div
                    key={step.label}
                    className={`flex items-center gap-3 transition-all ${
                      isActive ? 'opacity-100' : isCompleted ? 'opacity-60' : 'opacity-30'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-[#262626] text-[#F3F4F4]'
                          : isActive
                          ? 'bg-[#262626] text-[#F3F4F4]'
                          : 'bg-[#F3F4F4] text-[#262626] border border-[#262626]/20'
                      }`}
                    >
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-sm ${
                        isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
