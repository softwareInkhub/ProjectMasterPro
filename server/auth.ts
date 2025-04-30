import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';

// JWT secret key - in production this would be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '24h';

export interface AuthRequest extends Request {
  user?: User;
}

// Generate JWT token for a user
export function generateToken(user: User): string {
  // Create payload without sensitive information
  const payload = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    companyId: user.companyId,
    departmentId: user.departmentId,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Auth middleware to protect routes
export function authenticateJwt(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Authorization format should be Bearer [token]' });
  }

  const token = parts[1];
  
  // Check for demo token - for development purposes only
  const validDemoTokens = [
    // Token from direct-login.tsx
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZkNjk5MjBiLWEyMTQtNDc3Yi1iN2VjLTgwYTk3MDUzYzIwZSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MTI1MDQ4ODMsImV4cCI6MTc0NDA0MDg4M30.KSzp9MzJ2Lx0Rn8SSgRrkOzIgfDVtbUYrIBVl3Ceyt4",
    // Original demo token
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZkNjk5MjBiLWEyMTQtNDc3Yi1iN2VjLTgwYTk3MDUzYzIwZSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJmaXJzdE5hbWUiOiJBZG1pbiIsImxhc3ROYW1lIjoiVXNlciIsInJvbGUiOiJBRE1JTiIsImNvbXBhbnlJZCI6IjFlZjZiNmYxLTM0YjMtNGFiNS1iYTk0LTg4MDRmOTA5MDNiZiIsImRlcGFydG1lbnRJZCI6bnVsbCwiaWF0IjoxNzQ0ODIzMTA2fQ.oF5vRQjt42NsDPNVDJHh-xjbcGgSB_XGmfSn3v9X0b4"
  ];
  
  if (validDemoTokens.includes(token)) {
    // For demo token, create a demo user with ID "1" to match MemStorage admin user
    req.user = {
      id: "1", // This matches the ID in MemStorage
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      companyId: null, // No company in MemStorage yet
      password: "",
      status: "ACTIVE",
      departmentId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log("Authenticated with demo token for user:", req.user.email);
    return next();
  }

  try {
    // Verify token and attach user to request for non-demo tokens
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Middleware to check if user has required role
export function authorize(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
}
