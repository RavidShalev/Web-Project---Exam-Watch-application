import Navbar from './components/Navbar';
import Login from './components/Login';
import './App.css';
import { useState } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";


import Home from "./pages/Home";
import ExamClock from "./pages/ExamClock";
import Attendance from "./pages/Attendance";
import Report from "./pages/Report";
import Procedures from "./pages/Procedures";
import ExamBot from "./pages/ExamBot";

function App() {
  
    const [isLoggedIn, setIsLoggedIn] = useState(false);

  if(!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exam-clock" element={<ExamClock />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/report" element={<Report />} />
        <Route path="/procedures" element={<Procedures />} />
        <Route path="/exam-bot" element={<ExamBot />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
