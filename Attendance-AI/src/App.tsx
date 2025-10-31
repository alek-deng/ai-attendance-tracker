import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import FQS from '@/pages/FAQ';
import NotFound from "./pages/NotFound";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import LecturerDashboard from "./pages/Dashboard/LecturerDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import AttendanceCapture from "./pages/AttendanceCapture";
import ProtectedRoute from "./routes/ProtectedRoute";

const queryClient = new QueryClient();

// Dashboard Router - routes to correct dashboard based on role
const DashboardRouter = () => {
  const role = localStorage.getItem('userRole'); 
  
  console.log('DashboardRouter: Role is', role);

  switch (role) {
    case 'student':
      console.log('DashboardRouter: Rendering StudentDashboard');
      return <StudentDashboard />;
    case 'lecturer':
      console.log('DashboardRouter: Rendering LecturerDashboard');
      return <LecturerDashboard />;
    case 'admin':
      console.log('DashboardRouter: Rendering AdminDashboard');
      return <AdminDashboard />;
    default:
      console.error('DashboardRouter: Unknown role, redirecting to login. Role was:', role);
      // This case should ideally not be hit if ProtectedRoute works
      return <Navigate to="/login" replace />;
  }
};

// Unauthorized page component
const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
        <p className="text-xl text-gray-600 mb-8">Unauthorized Access</p>
        <a 
          href="/login" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Return to Login
        </a>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/fqs" element={<FQS />} />
          
          {/* Protected Dashboard Route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student', 'lecturer', 'admin']}>
                <DashboardRouter />
              </ProtectedRoute>
            } 
          />
          
          {/* Attendance Capture Route - For Lecturers/Admins */}
          <Route 
            path="/attendance-capture" 
            element={
              <ProtectedRoute allowedRoles={['lecturer', 'admin']}>
                <AttendanceCapture />
              </ProtectedRoute>
            } 
          />
          
          {/* Unauthorized page */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;