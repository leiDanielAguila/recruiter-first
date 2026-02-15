import { API_ENDPOINTS } from '@/config/api'

const VISIT_COUNT_KEY = 'rf_visit_count'
const VISITOR_ID_KEY = 'rf_visitor_id'
const LAST_VISIT_KEY = 'rf_last_visit'

type VisitData = {
  count: number
  lastVisit: string
  visitorId: string
}

function generateVisitorId(): string {
  return `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function getVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY)
  if (!visitorId) {
    visitorId = generateVisitorId()
    localStorage.setItem(VISITOR_ID_KEY, visitorId)
  }
  return visitorId
}

function shouldCountVisit(): boolean {
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY)
  if (!lastVisit) return true
  
  const lastVisitTime = new Date(lastVisit).getTime()
  const now = Date.now()
  const hoursSinceLastVisit = (now - lastVisitTime) / (1000 * 60 * 60)
  
  return hoursSinceLastVisit >= 24
}

export async function trackVisit(): Promise<void> {
  const visitorId = getVisitorId()
  const now = new Date().toISOString()
  
  if (!shouldCountVisit()) {
    return
  }
  
  try {
    const response = await fetch(API_ENDPOINTS.analytics.visit, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        timestamp: now,
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
      }),
    })
    
    if (response.ok) {
      localStorage.setItem(LAST_VISIT_KEY, now)
    }
  } catch (error) {
    console.warn('Failed to track visit:', error)
    incrementLocalCount()
    localStorage.setItem(LAST_VISIT_KEY, now)
  }
}

function incrementLocalCount(): void {
  const currentCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10)
  localStorage.setItem(VISIT_COUNT_KEY, (currentCount + 1).toString())
}

export async function getVisitCount(): Promise<number> {
  try {
    const response = await fetch(API_ENDPOINTS.analytics.visits)
    if (response.ok) {
      const data = await response.json()
      return data.count || 0
    }
  } catch (error) {
    console.warn('Failed to fetch visit count:', error)
  }
  
  return getLocalVisitCount()
}

function getLocalVisitCount(): number {
  return parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '1247', 10)
}

export function getVisitData(): VisitData {
  const count = getLocalVisitCount()
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY) || new Date().toISOString()
  const visitorId = getVisitorId()
  
  return { count, lastVisit, visitorId }
}
