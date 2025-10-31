import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, redirectPath = '/login', children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole'); 

  // Debug logging
  console.log('ProtectedRoute check:', {
    hasToken: !!token,
    tokenLength: token?.length,
    role: role,
    allowedRoles: allowedRoles,
    roleInAllowed: role ? allowedRoles.includes(role) : false
  });

  // 1. Check if user has a token
  if (!token) {
    console.log('ProtectedRoute: No token found, redirecting to login');
    return <Navigate to={redirectPath} replace />;
  }

  // 2. Check if token's role is in the allowed list
  if (!role) {
    console.log('ProtectedRoute: No role found, redirecting to login');
    return <Navigate to={redirectPath} replace />;
  }
  
  if (!allowedRoles.includes(role)) {
    console.log(`ProtectedRoute: Role "${role}" not in allowed roles [${allowedRoles.join(', ')}]`);
    // If role is missing or not allowed, send to Unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. If token exists and role is allowed, show the page
  console.log(`ProtectedRoute: ✓ Access granted for role "${role}"`);
  return children ? children : <Outlet />;
};

export default ProtectedRoute;