import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Protects routes based on authentication status and user role
 * 
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute requiredRole={['admin', 'manager']}>
 *   <ManagerPage />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  fallback = null 
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    hasRole 
  } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback || <LoadingScreen />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is required, check if user has the role
  if (requiredRole) {
    const hasAccess = hasRole(requiredRole);
    
    if (!hasAccess) {
      return <AccessDeniedScreen userRole={user?.role} />;
    }
  }

  // User is authenticated and has required role (if specified)
  return children;
};

/**
 * Loading Screen Component
 */
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="inline-block">
        <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p className="mt-4 text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

/**
 * Access Denied Screen Component
 */
const AccessDeniedScreen = ({ userRole }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="mb-6">
        <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v2m0 0v2m0-10V5m0 2a1 1 0 110-2 1 1 0 010 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5a7 7 0 100 14 7 7 0 000-14z" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
      
      <p className="text-gray-600 mb-4">
        You don't have permission to access this page.
      </p>

      {userRole && (
        <p className="text-sm text-gray-500 mb-6">
          Your role: <span className="font-semibold capitalize">{userRole}</span>
        </p>
      )}

      <div className="space-y-3">
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </a>
        
        <p className="text-sm text-gray-500">
          If you believe this is a mistake, please contact the administrator.
        </p>
      </div>
    </div>
  </div>
);

/**
 * RequireRole Hook
 * Usage in components: const canAccess = useRequireRole('admin');
 */
export const useRequireRole = (requiredRole) => {
  const { hasRole, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return false;
  }

  return hasRole(requiredRole);
};

/**
 * ConditionalRoute Component
 * Shows content based on role, useful for conditional rendering within pages
 * 
 * Usage:
 * <ConditionalRoute requiredRole="admin">
 *   <AdminPanel />
 * </ConditionalRoute>
 * 
 * <ConditionalRoute requiredRole="admin" fallback={<ManagerPanel />}>
 *   <AdminPanel />
 * </ConditionalRoute>
 */
export const ConditionalRoute = ({ 
  children, 
  requiredRole = null,
  fallback = null 
}) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || null;
  }

  return children;
};

/**
 * RoleBasedMenu Component
 * Shows menu items based on user role
 * 
 * Usage:
 * <RoleBasedMenu role="admin">
 *   <MenuItem>Admin Settings</MenuItem>
 * </RoleBasedMenu>
 */
export const RoleBasedMenu = ({ role, children, fallback = null }) => {
  const { hasRole } = useAuth();

  if (!hasRole(role)) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;
