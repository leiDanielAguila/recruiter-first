import { useEffect, useState } from 'react'
import { FileText, Briefcase, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { trackVisit, getVisitCount } from '@/services/analytics'

export function LandingPage() {
  const navigate = useNavigate()
  const [visitCount, setVisitCount] = useState(1247)

  // useEffect(() => {
  //   const initAnalytics = async () => {
  //     await trackVisit()
  //     const count = await getVisitCount()
  //     setVisitCount(count)
  //   }
    
  //   initAnalytics()
  // }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-4 py-12">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center max-w-2xl">
          {/* Logo icons above title */}
          <div className="mb-8 flex items-center justify-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-primary" />
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Recruiter First
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            The AI-powered platform that helps recruiters find and connect with top talent faster than ever.
          </p>
          <Button size="lg" className="text-lg" onClick={() => navigate('/upload')}>
            Get Started
          </Button>
        </div>
      </div>
      
      {/* Website visit count at bottom */}
      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground mb-2">Join thousands of recruiters</p>
        <div className="flex items-center gap-2 justify-center">
          <div className="text-3xl font-bold text-foreground">{visitCount.toLocaleString()}</div>
          <span className="text-muted-foreground">website visits</span>
        </div>
      </div>
    </div>
  )
}
