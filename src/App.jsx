import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import Weather from './pages/Weather'
import EmailGenerator from './pages/EmailGenerator'

export default function App() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/email-generator" element={<EmailGenerator />} />
      </Routes>
    </div>
  )
}
