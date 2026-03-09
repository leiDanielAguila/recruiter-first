import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from '@/components/LandingPage'
import { DashboardLayout } from '@/components/layout'
import { JobUpload } from '@/components/pages/JobUpload'
import { 
  LetterArchitect, 
  SmartPdfEditor, 
  JobPool, 
  SettingsPage 
} from '@/components/pages'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/job-pool" replace />} />
          <Route path="job-pool" element={<JobPool />} />
          <Route path="job-matcher" element={<JobUpload />} />
          <Route path="letter-architect" element={<LetterArchitect />} />
          <Route path="smart-pdf-editor" element={<SmartPdfEditor />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
