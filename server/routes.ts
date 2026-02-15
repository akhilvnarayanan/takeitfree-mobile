import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler wrapper
  const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => 
    (req: Request, res: Response, next: any) => Promise.resolve(fn(req, res)).catch(next);

  // User Profile Routes
  app.get("/api/users/:userId", asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  }));

  // Sign up Route
  app.post("/api/auth/signup", asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }
    
    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ error: "Username already exists" });
    }
    
    const user = await storage.createUser({ username, password });
    res.status(201).json(user);
  }));

  // Sign in Route
  app.post("/api/auth/signin", asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }
    
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    res.json(user);
  }));

  // TODO: Phone OTP Routes (requires Twilio or similar service)
  // app.post("/api/auth/send-otp", asyncHandler(async (req: Request, res: Response) => {
  //   const { phone } = req.body;
  //   // Send OTP via SMS
  //   res.json({ success: true, message: "OTP sent" });
  // }));

  // app.post("/api/auth/verify-otp", asyncHandler(async (req: Request, res: Response) => {
  //   const { phone, code } = req.body;
  //   // Verify OTP code
  //   res.json({ success: true, verified: true });
  // }));

  // TODO: Social Auth Routes (requires OAuth setup)
  // app.post("/api/auth/social", asyncHandler(async (req: Request, res: Response) => {
  //   const { provider, token } = req.body;
  //   // Validate OAuth token and create/fetch user
  //   res.json({ user: {} });
  // }));

  // Chat Routes
  app.post("/api/chats", asyncHandler(async (req: Request, res: Response) => {
    const { participantOneId, participantTwoId, itemId } = req.body;
    if (!participantOneId || !participantTwoId) {
      return res.status(400).json({ error: "Missing participant IDs" });
    }
    res.status(201).json({ 
      id: "chat_" + Date.now(), 
      participantOneId, 
      participantTwoId, 
      itemId,
      createdAt: new Date().toISOString()
    });
  }));

  app.get("/api/chats/:chatId", asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ error: "Missing chatId" });
    }
    res.json({ id: chatId, createdAt: new Date().toISOString() });
  }));

  app.get("/api/chats/:chatId/messages", asyncHandler(async (req: Request, res: Response) => {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ error: "Missing chatId" });
    }
    res.json({ chatId, messages: [] });
  }));

  // Message Routes
  app.post("/api/messages", asyncHandler(async (req: Request, res: Response) => {
    const { chatId, senderId, content } = req.body;
    if (!chatId || !senderId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    res.status(201).json({
      id: "msg_" + Date.now(),
      chatId,
      senderId,
      content,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }));

  app.patch("/api/messages/:messageId/read", asyncHandler(async (req: Request, res: Response) => {
    const { messageId } = req.params;
    if (!messageId) {
      return res.status(400).json({ error: "Missing messageId" });
    }
    res.json({ id: messageId, isRead: true });
  }));

  // Report Routes
  app.post("/api/reports", asyncHandler(async (req: Request, res: Response) => {
    const { reporterId, reportedUserId, reason, details } = req.body;
    if (!reporterId || !reportedUserId || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    res.status(201).json({
      id: "report_" + Date.now(),
      reporterId,
      reportedUserId,
      reason,
      details,
      status: "pending",
      createdAt: new Date().toISOString()
    });
  }));

  app.get("/api/reports", asyncHandler(async (req: Request, res: Response) => {
    // Admin endpoint to view pending reports
    res.json({ reports: [] });
  }));

  // Moment Comments Routes
  app.post("/api/moments/:momentId/comments", asyncHandler(async (req: Request, res: Response) => {
    const { momentId } = req.params;
    const { userId, content } = req.body;
    if (!momentId || !userId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    res.status(201).json({
      id: "comment_" + Date.now(),
      momentId,
      userId,
      content,
      createdAt: new Date().toISOString()
    });
  }));

  app.delete("/api/moments/:momentId/comments/:commentId", asyncHandler(async (req: Request, res: Response) => {
    const { momentId, commentId } = req.params;
    if (!momentId || !commentId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    res.json({ id: commentId, momentId });
  }));

  // Moment Appreciation Routes
  app.post("/api/moments/:momentId/appreciate", asyncHandler(async (req: Request, res: Response) => {
    const { momentId } = req.params;
    const { userId } = req.body;
    if (!momentId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    res.status(201).json({
      id: "like_" + Date.now(),
      momentId,
      userId,
      createdAt: new Date().toISOString()
    });
  }));

  app.delete("/api/moments/:momentId/appreciate/:userId", asyncHandler(async (req: Request, res: Response) => {
    const { momentId, userId } = req.params;
    if (!momentId || !userId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    res.json({ momentId, userId });
  }));

  // Health check
  app.get("/api/health", asyncHandler(async (req: Request, res: Response) => {
    res.json({ status: "ok", message: "TakeItFree API is running" });
  }));

  const httpServer = createServer(app);

  return httpServer;
}
