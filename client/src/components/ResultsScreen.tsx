import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Lightbulb,
  ArrowLeft,
  Download
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export type MatchResult = {
  match_score: number
  summary: string
  strengths: string[]
  gaps: string[]
  recommendations: string[]
}

type ResultsScreenProps = {
  result: MatchResult
  onBack: () => void
}

export function ResultsScreen({ result, onBack }: ResultsScreenProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Weak Match'
  }

  const pieData = [
    { name: 'Match', value: result.match_score, color: '#262626' },
    { name: 'Gap', value: 100 - result.match_score, color: '#F3F4F4' },
  ]

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Match Score Card */}
        <Card className="border-[#262626]">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Candidate Match Analysis</CardTitle>
            <CardDescription>AI-powered evaluation results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Score Visualization */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative w-48 h-48 md:w-56 md:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl md:text-5xl font-bold text-[#262626]">
                      {result.match_score}
                    </span>
                    <span className="text-sm text-muted-foreground">out of 100</span>
                  </div>
                </div>
                <div className="text-center">
                  <Badge 
                    variant="outline" 
                    className="text-sm px-4 py-1"
                    style={{ 
                      borderColor: getScoreColor(result.match_score),
                      color: getScoreColor(result.match_score)
                    }}
                  >
                    {getScoreLabel(result.match_score)}
                  </Badge>
                </div>
              </div>

              {/* Summary */}
              <div className="flex flex-col justify-center space-y-4">
                <h3 className="text-lg font-semibold">Executive Summary</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {result.summary}
                </p>
                <div className="pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Fit</span>
                      <span className="font-medium">{result.match_score}%</span>
                    </div>
                    <Progress value={result.match_score} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strengths and Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="border-[#262626]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Key Strengths
              </CardTitle>
              <CardDescription>
                What makes this candidate stand out
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[#F3F4F4]/50 hover:bg-[#F3F4F4] transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Gaps */}
          <Card className="border-[#262626]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Identified Gaps
              </CardTitle>
              <CardDescription>
                Areas for consideration or development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.gaps.map((gap, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[#F3F4F4]/50 hover:bg-[#F3F4F4] transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">{gap}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="border-[#262626]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Recommendations
            </CardTitle>
            <CardDescription>
              Suggested next steps and considerations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-[#262626]/20 bg-[#F3F4F4]/30 hover:bg-[#F3F4F4] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#262626] text-[#F3F4F4] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
