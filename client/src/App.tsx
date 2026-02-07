import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/components/LandingPage'
import { JobUpload } from '@/components/JobUpload'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<JobUpload />} />
      </Routes>
    </Router>
  )
}

export default App
