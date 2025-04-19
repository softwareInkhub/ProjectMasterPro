import { iamClient } from './aws-config';
import { 
  GetUserCommand, 
  ListUsersCommand,
  CreateUserCommand, 
  GetUserResponse,
  UpdateUserCommand,
  User as IAMUser
} from '@aws-sdk/client-iam';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';

// Secret for JWT signing - should be in env but for demo it's here
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Interface for auth request
export interface AuthRequest extends Request {
  user?: User;
}

// Verify IAM user credentials
export async function verifyIAMCredentials(username: string, password: string): Promise<IAMUser | null> {
  try {
    // In a real application, you would use AWS STS AssumeRole or GetSessionToken
    // with the provided credentials to verify them
    // For demo purposes, we'll just check if the user exists in IAM
    
    const command = new GetUserCommand({
      UserName: username
    });
    
    const response = await iamClient.send(command);
    
    if (response.User) {
      // In real implementation, we'd actually verify the password
      // Since IAM doesn't provide a direct password verification mechanism,
      // you'd typically use STS with the credentials or implement another auth method
      
      return response.User;
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying IAM credentials:', error);
    return null;
  }
}

// Get IAM users
export async function getIAMUsers() {
  try {
    const command = new ListUsersCommand({});
    const response = await iamClient.send(command);
    return response.Users || [];
  } catch (error) {
    console.error('Error getting IAM users:', error);
    return [];
  }
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Authentication middleware
export function authenticateJwt(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      
      req.user = user as User;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// Authorization middleware
export function authorize(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.sendStatus(401);
    }
    
    if (roles.length === 0 || roles.includes(req.user.role)) {
      next();
    } else {
      res.sendStatus(403);
    }
  };
}

// Create IAM user
export async function createIAMUser(username: string): Promise<IAMUser | null> {
  try {
    const command = new CreateUserCommand({
      UserName: username
    });
    
    const response = await iamClient.send(command);
    return response.User || null;
  } catch (error) {
    console.error('Error creating IAM user:', error);
    return null;
  }
}

// Map IAM user to application user
export function mapIAMUserToAppUser(iamUser: IAMUser): Partial<User> {
  return {
    email: iamUser.UserName,
    firstName: iamUser.UserName?.split('@')[0] || '',
    lastName: '',
    role: 'ADMIN', // Using a valid role from the schema
    // Other fields would be populated from the database
  };
}