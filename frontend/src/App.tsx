import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RepairerDashboard from "./pages/RepairerDashboard";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Dashboard router based on user role
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'repairer':
      return <RepairerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App = () => {
  // Add this state to store the message from the backend
   // The empty array [] means this effect runs only once
  return (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin', 'repairer']}>
                    <DashboardRouter />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
  );
};

export default App;
