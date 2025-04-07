import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';

interface AuthRoutesProps {
  children: ReactNode;
}

function AuthRoutes({ children }: AuthRoutesProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation('/login');
    return null;
  }

  // Return children (protected routes) if authenticated
  return <>{children}</>;
}

export default AuthRoutes;