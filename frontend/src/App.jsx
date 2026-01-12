import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import StudentList from './components/StudentList'
import StudentCard from './components/StudentCard'
import Leaderboard from './components/Leaderboard'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students/:collegeId" element={<StudentList />} />
        <Route path="/student/:studentId" element={<StudentCard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  )
}

export default App
