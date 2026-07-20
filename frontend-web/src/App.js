import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Exam from './pages/Exam';
import ExamResult from './pages/ExamResult';
import { History } from './pages/History';
import Home from './pages/Home';
import Login from './pages/Login';
import { Profile } from './pages/Profile';
import QuestionBank from './pages/QuestionBank';
import Register from './pages/Register';
import Regulations from './pages/Regulations';
import TrafficSigns from './pages/TrafficSigns';
import { WrongAnswers } from './pages/WrongAnswers';
import AdminDashboard from './pages/admin/AdminDashboard';

// Layout có Navbar cho user
function UserLayout({ children }) {
  return <><Navbar /><div style={{ minHeight: 'calc(100vh - 56px)' }}>{children}</div></>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User pages — có Navbar */}
          <Route path="/" element={<ProtectedRoute><UserLayout><Home /></UserLayout></ProtectedRoute>} />
          <Route path="/question-bank" element={<ProtectedRoute><UserLayout><QuestionBank /></UserLayout></ProtectedRoute>} />
          <Route path="/wrong-answers" element={<ProtectedRoute><UserLayout><WrongAnswers /></UserLayout></ProtectedRoute>} />
          <Route path="/traffic-signs" element={<ProtectedRoute><UserLayout><TrafficSigns /></UserLayout></ProtectedRoute>} />
          <Route path="/regulations"   element={<ProtectedRoute><UserLayout><Regulations /></UserLayout></ProtectedRoute>} />
          <Route path="/history"       element={<ProtectedRoute><UserLayout><History /></UserLayout></ProtectedRoute>} />
          <Route path="/profile"       element={<ProtectedRoute><UserLayout><Profile /></UserLayout></ProtectedRoute>} />

          {/* Exam — không có Navbar để tập trung thi */}
          <Route path="/exam"                    element={<ProtectedRoute><Exam /></ProtectedRoute>} />
          <Route path="/exam/result/:sessionId"  element={<ProtectedRoute><ExamResult /></ProtectedRoute>} />

          {/* Admin — layout riêng */}
          <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
