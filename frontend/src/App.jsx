import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import StudentList from './components/StudentList'
import StudentCard from './components/StudentCard'
import Leaderboard from './components/Leaderboard'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<StudentList />} />
        <Route path="/student/:studentId" element={<StudentCard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  )
}

export default App
