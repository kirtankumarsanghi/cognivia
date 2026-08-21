import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage';
import Login from './components/landing/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import StudentLayout from './components/layouts/StudentLayout';
import EducatorLayout from './components/layouts/EducatorLayout';
import { AuthProvider } from './hooks/useAuth';
import Dashboard from './components/dashboard/Dashboard';
import CourseView from './components/dashboard/CourseView';
import Tutor from './components/dashboard/Tutor';
import Revision from './components/dashboard/Revision';
import Courses from './components/dashboard/Courses';

import EducatorDashboard from './components/educator/EducatorDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRole="student" />}>
            <Route element={<StudentLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:id" element={<CourseView />} />
              <Route path="/tutor" element={<Tutor />} />
              <Route path="/revision" element={<Revision />} />
            </Route>
          </Route>

          {/* Protected Educator Routes */}
          <Route element={<ProtectedRoute allowedRole="educator" />}>
            <Route element={<EducatorLayout />}>
              <Route path="/educator" element={<EducatorDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
