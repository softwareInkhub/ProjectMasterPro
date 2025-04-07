import express, { Router, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginUserSchema, insertUserSchema, insertCompanySchema, 
  insertDepartmentSchema, insertGroupSchema, insertTeamSchema,
  insertProjectSchema, insertEpicSchema, insertStorySchema,
  insertTaskSchema, insertCommentSchema, insertAttachmentSchema,
  insertNotificationSchema, registerUserSchema, InsertUser
} from "@shared/schema";
import { generateToken, authenticateJwt, AuthRequest, authorize } from "./auth";
import { z } from "zod";
import { ZodError } from "zod-validation-error";

export async function registerRoutes(app: express.Express): Promise<Server> {
  const apiRouter = Router();
  
  // Mount the API router on /api path
  app.use('/api', apiRouter);
  
  // Auth routes
  apiRouter.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      const user = await storage.getUserByEmail(validatedData.email);
      
      if (!user || user.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      
      return res.json({
        token,
        user: userWithoutPassword,
        expiresIn: 24 * 60 * 60 // 24 hours in seconds
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const { companyName, ...userData } = req.body;
      
      // Use our dedicated registration schema
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }

      // Create a company if companyName is provided
      let company = null;
      if (companyName) {
        company = await storage.createCompany({
          name: companyName,
          description: `${companyName} - Organization`,
        });
      }
      
      // Prepare user data for storage
      const userToCreate: InsertUser = {
        email: validatedData.email,
        password: validatedData.password,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role || "ADMIN", // Default to ADMIN for first user
        companyId: company ? company.id : "", // Required field
        status: "ACTIVE"
      };
      
      // Create the user
      const user = await storage.createUser(userToCreate);
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json({
        token,
        user: userWithoutPassword,
        company: company,
        expiresIn: 24 * 60 * 60 // 24 hours in seconds
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Company routes
  apiRouter.get("/companies", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const companies = await storage.getCompanies();
      return res.json(companies);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/companies/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      return res.json(company);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/companies", authenticateJwt, authorize(["ADMIN"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      return res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/companies/:id", authenticateJwt, authorize(["ADMIN"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(req.params.id, validatedData);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      return res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/companies/:id", authenticateJwt, authorize(["ADMIN"]), async (req: AuthRequest, res: Response) => {
    try {
      const success = await storage.deleteCompany(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Company not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Department routes
  apiRouter.get("/departments", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const { companyId } = req.query;
      const departments = await storage.getDepartments(companyId as string);
      return res.json(departments);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/departments/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const department = await storage.getDepartment(req.params.id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      return res.json(department);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/departments", authenticateJwt, authorize(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      return res.status(201).json(department);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/departments/:id", authenticateJwt, authorize(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertDepartmentSchema.partial().parse(req.body);
      const department = await storage.updateDepartment(req.params.id, validatedData);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      return res.json(department);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/departments/:id", authenticateJwt, authorize(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
    try {
      const success = await storage.deleteDepartment(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Department not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Group routes
  apiRouter.get("/groups", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const { companyId } = req.query;
      const groups = await storage.getGroups(companyId as string);
      return res.json(groups);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/groups/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const group = await storage.getGroup(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      return res.json(group);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/groups", authenticateJwt, authorize(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(validatedData);
      return res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/groups/:id", authenticateJwt, authorize(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertGroupSchema.partial().parse(req.body);
      const group = await storage.updateGroup(req.params.id, validatedData);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      return res.json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/groups/:id", authenticateJwt, authorize(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
    try {
      const success = await storage.deleteGroup(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Group not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  apiRouter.get("/users", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const { companyId, departmentId } = req.query;
      const users = await storage.getUsers(
        companyId as string,
        departmentId as string
      );
      
      // Don't send passwords back to client
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.json(usersWithoutPasswords);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/users/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/users", authenticateJwt, authorize(["ADMIN"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/users/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      // Only allow users to update themselves or admins to update anyone
      if (req.user!.id !== req.params.id && req.user!.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden - You can only update your own profile" });
      }
      
      const validatedData = insertUserSchema.partial().parse(req.body);
      
      // If email is being changed, check if it's already in use
      if (validatedData.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.id !== req.params.id) {
          return res.status(409).json({ message: "Email already in use" });
        }
      }
      
      const user = await storage.updateUser(req.params.id, validatedData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      
      return res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/users/:id", authenticateJwt, authorize(["ADMIN"]), async (req: AuthRequest, res: Response) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Team routes
  apiRouter.get("/teams", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const { companyId } = req.query;
      const teams = await storage.getTeams(companyId as string);
      return res.json(teams);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/teams/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      return res.json(team);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/teams/:id/members", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const members = await storage.getTeamMembers(req.params.id);
      
      // Don't send passwords back to client
      const membersWithoutPasswords = members.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.json(membersWithoutPasswords);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/teams", authenticateJwt, authorize(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      return res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/teams/:id", authenticateJwt, authorize(["ADMIN", "MANAGER", "TEAM_LEAD"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertTeamSchema.partial().parse(req.body);
      const team = await storage.updateTeam(req.params.id, validatedData);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      return res.json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/teams/:id", authenticateJwt, authorize(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
    try {
      const success = await storage.deleteTeam(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Team not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/teams/:id/members/:userId", authenticateJwt, authorize(["ADMIN", "MANAGER", "TEAM_LEAD"]), async (req: AuthRequest, res: Response) => {
    try {
      const success = await storage.addUserToTeam(req.params.id, req.params.userId);
      if (!success) {
        return res.status(404).json({ message: "Team or user not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/teams/:id/members/:userId", authenticateJwt, authorize(["ADMIN", "MANAGER", "TEAM_LEAD"]), async (req: AuthRequest, res: Response) => {
    try {
      const success = await storage.removeUserFromTeam(req.params.id, req.params.userId);
      if (!success) {
        return res.status(404).json({ message: "Team member not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Project routes
  apiRouter.get("/projects", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const { companyId, teamId } = req.query;
      const projects = await storage.getProjects(
        companyId as string,
        teamId as string
      );
      return res.json(projects);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/projects/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      return res.json(project);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/projects", authenticateJwt, authorize(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      return res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/projects/:id", authenticateJwt, authorize(["ADMIN", "MANAGER", "TEAM_LEAD"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      return res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/projects/:id", authenticateJwt, authorize(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Epic routes
  apiRouter.get("/epics", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const { projectId } = req.query;
      const epics = await storage.getEpics(projectId as string);
      return res.json(epics);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/epics/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const epic = await storage.getEpic(req.params.id);
      if (!epic) {
        return res.status(404).json({ message: "Epic not found" });
      }
      return res.json(epic);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/epics", authenticateJwt, authorize(["ADMIN", "MANAGER", "TEAM_LEAD"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertEpicSchema.parse(req.body);
      const epic = await storage.createEpic(validatedData);
      return res.status(201).json(epic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/epics/:id", authenticateJwt, authorize(["ADMIN", "MANAGER", "TEAM_LEAD"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertEpicSchema.partial().parse(req.body);
      const epic = await storage.updateEpic(req.params.id, validatedData);
      if (!epic) {
        return res.status(404).json({ message: "Epic not found" });
      }
      return res.json(epic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/epics/:id", authenticateJwt, authorize(["ADMIN", "MANAGER", "TEAM_LEAD"]), async (req: AuthRequest, res: Response) => {
    try {
      const success = await storage.deleteEpic(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Epic not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Story routes
  apiRouter.get("/stories", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const { epicId } = req.query;
      const stories = await storage.getStories(epicId as string);
      return res.json(stories);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/stories/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const story = await storage.getStory(req.params.id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      return res.json(story);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/stories", authenticateJwt, authorize(["ADMIN", "MANAGER", "TEAM_LEAD", "DEVELOPER"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertStorySchema.parse(req.body);
      const story = await storage.createStory(validatedData);
      return res.status(201).json(story);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/stories/:id", authenticateJwt, authorize(["ADMIN", "MANAGER", "TEAM_LEAD", "DEVELOPER"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertStorySchema.partial().parse(req.body);
      const story = await storage.updateStory(req.params.id, validatedData);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      return res.json(story);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/stories/:id", authenticateJwt, authorize(["ADMIN", "MANAGER", "TEAM_LEAD"]), async (req: AuthRequest, res: Response) => {
    try {
      const success = await storage.deleteStory(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Story not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Task routes
  apiRouter.get("/tasks", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const { storyId, assigneeId } = req.query;
      const tasks = await storage.getTasks(
        storyId as string,
        assigneeId as string
      );
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/tasks/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.json(task);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/tasks", authenticateJwt, authorize(["ADMIN", "MANAGER", "TEAM_LEAD", "DEVELOPER"]), async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      return res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/tasks/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, validatedData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/tasks/:id", authenticateJwt, authorize(["ADMIN", "MANAGER", "TEAM_LEAD"]), async (req: AuthRequest, res: Response) => {
    try {
      const success = await storage.deleteTask(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Comment routes
  apiRouter.get("/comments", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const { entityType, entityId } = req.query;
      
      if (!entityType || !entityId) {
        return res.status(400).json({ message: "entityType and entityId are required query parameters" });
      }
      
      const comments = await storage.getComments(
        entityType as string,
        entityId as string
      );
      return res.json(comments);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/comments", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const comment = await storage.createComment(validatedData);
      return res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/comments/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      // Get the comment to check ownership
      const comment = await storage.getComment(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Only allow users to update their own comments or admins to update any comment
      if (comment.userId !== req.user!.id && req.user!.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden - You can only update your own comments" });
      }
      
      const validatedData = insertCommentSchema.partial().omit({ userId: true }).parse(req.body);
      const updatedComment = await storage.updateComment(req.params.id, validatedData);
      
      return res.json(updatedComment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/comments/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      // Get the comment to check ownership
      const comment = await storage.getComment(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Only allow users to delete their own comments or admins to delete any comment
      if (comment.userId !== req.user!.id && req.user!.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden - You can only delete your own comments" });
      }
      
      const success = await storage.deleteComment(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Attachment routes
  apiRouter.get("/attachments", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const { entityType, entityId } = req.query;
      
      if (!entityType || !entityId) {
        return res.status(400).json({ message: "entityType and entityId are required query parameters" });
      }
      
      const attachments = await storage.getAttachments(
        entityType as string,
        entityId as string
      );
      return res.json(attachments);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/attachments", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertAttachmentSchema.parse({
        ...req.body,
        uploadedById: req.user!.id
      });
      const attachment = await storage.createAttachment(validatedData);
      return res.status(201).json(attachment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/attachments/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const attachment = await storage.getAttachment(req.params.id);
      if (!attachment) {
        return res.status(404).json({ message: "Attachment not found" });
      }
      
      // Only allow users to delete their own attachments or admins to delete any attachment
      if (attachment.uploadedById !== req.user!.id && req.user!.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden - You can only delete your own attachments" });
      }
      
      const success = await storage.deleteAttachment(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notification routes
  apiRouter.get("/notifications", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const notifications = await storage.getNotifications(req.user!.id);
      return res.json(notifications);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/notifications/:id/read", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const notification = await storage.getNotification(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Only allow users to mark their own notifications as read
      if (notification.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden - You can only mark your own notifications as read" });
      }
      
      const success = await storage.markNotificationAsRead(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/notifications/:id", authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const notification = await storage.getNotification(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Only allow users to delete their own notifications
      if (notification.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden - You can only delete your own notifications" });
      }
      
      const success = await storage.deleteNotification(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mount API router at /api prefix
  app.use("/api", apiRouter);

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
