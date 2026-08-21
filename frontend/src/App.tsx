import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
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
import Achievements from './components/dashboard/Achievements';
import StudyGroups from './components/dashboard/StudyGroups';
import KnowledgeGraphView from './components/dashboard/KnowledgeGraphView';
import ClassRoster from './components/educator/ClassRoster';
import CurriculumBuilder from './components/educator/CurriculumBuilder';
import CustomCursor from './components/CustomCursor';

function RouteTransition({ children }: { children: ReactNode }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<RouteTransition><LandingPage /></RouteTransition>} />
        <Route path="/login" element={<RouteTransition><Login /></RouteTransition>} />
        
        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<RouteTransition><Dashboard /></RouteTransition>} />
            <Route path="/courses" element={<RouteTransition><Courses /></RouteTransition>} />
            <Route path="/course/:id" element={<RouteTransition><CourseView /></RouteTransition>} />
            <Route path="/tutor" element={<RouteTransition><Tutor /></RouteTransition>} />
            <Route path="/revision" element={<RouteTransition><Revision /></RouteTransition>} />
            <Route path="/study-groups" element={<RouteTransition><StudyGroups /></RouteTransition>} />
            <Route path="/knowledge-graph" element={<RouteTransition><KnowledgeGraphView /></RouteTransition>} />
            <Route path="/achievements" element={<RouteTransition><Achievements /></RouteTransition>} />
          </Route>
        </Route>

        {/* Protected Educator Routes */}
        <Route element={<ProtectedRoute allowedRole="educator" />}>
          <Route element={<EducatorLayout />}>
            <Route path="/educator" element={<RouteTransition><EducatorDashboard /></RouteTransition>} />
            <Route path="/educator/roster" element={<RouteTransition><ClassRoster /></RouteTransition>} />
            <Route path="/educator/curriculum" element={<RouteTransition><CurriculumBuilder /></RouteTransition>} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <CustomCursor />
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
