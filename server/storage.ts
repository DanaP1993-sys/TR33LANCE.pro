import { 
  type User, type InsertUser,
  type Job, type InsertJob,
  type Contractor, type InsertContractor,
  type Dispute, type InsertDispute,
  type Notification, type InsertNotification,
  type DirectMessage, type InsertDirectMessage,
  users, jobs, contractors, disputes, notifications, directMessages
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, or, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  addRating(id: string, rating: number): Promise<User | undefined>;
  
  // Jobs
  getJobs(): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined>;
  
  // Contractors
  getContractors(): Promise<Contractor[]>;
  getContractor(id: number): Promise<Contractor | undefined>;
  createContractor(contractor: InsertContractor): Promise<Contractor>;
  
  // Disputes
  getDisputes(): Promise<Dispute[]>;
  getDispute(id: number): Promise<Dispute | undefined>;
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  updateDispute(id: number, updates: Partial<Dispute>): Promise<Dispute | undefined>;
  
  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<Notification | undefined>;
  
  // Direct Messages
  getConversations(userId: string): Promise<{ recipientId: string; recipientName: string; lastMessage: string; lastMessageAt: Date; unreadCount: number; jobId: number | null }[]>;
  getDirectMessages(userId: string, otherUserId: string): Promise<DirectMessage[]>;
  sendDirectMessage(message: InsertDirectMessage): Promise<DirectMessage>;
  markDirectMessageRead(id: number): Promise<DirectMessage | undefined>;
  markConversationRead(userId: string, otherUserId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async addRating(id: string, rating: number): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const currentRatings = existingUser.ratings || [];
    const newRatings = [...currentRatings, rating];
    
    const [user] = await db.update(users)
      .set({ ratings: newRatings })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Jobs
  async getJobs(): Promise<Job[]> {
    return db.select().from(jobs).orderBy(jobs.createdAt);
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const [updatedJob] = await db.update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }

  // Contractors
  async getContractors(): Promise<Contractor[]> {
    return db.select().from(contractors);
  }

  async getContractor(id: number): Promise<Contractor | undefined> {
    const [contractor] = await db.select().from(contractors).where(eq(contractors.id, id));
    return contractor;
  }

  async createContractor(contractor: InsertContractor): Promise<Contractor> {
    const [newContractor] = await db.insert(contractors).values(contractor).returning();
    return newContractor;
  }

  // Disputes
  async getDisputes(): Promise<Dispute[]> {
    return db.select().from(disputes).orderBy(desc(disputes.createdAt));
  }

  async getDispute(id: number): Promise<Dispute | undefined> {
    const [dispute] = await db.select().from(disputes).where(eq(disputes.id, id));
    return dispute;
  }

  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const [newDispute] = await db.insert(disputes).values(dispute).returning();
    return newDispute;
  }

  async updateDispute(id: number, updates: Partial<Dispute>): Promise<Dispute | undefined> {
    const [updated] = await db.update(disputes)
      .set(updates)
      .where(eq(disputes.id, id))
      .returning();
    return updated;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  // Direct Messages
  async getConversations(userId: string): Promise<{ recipientId: string; recipientName: string; lastMessage: string; lastMessageAt: Date; unreadCount: number; jobId: number | null }[]> {
    const allMessages = await db.select().from(directMessages)
      .where(or(
        eq(directMessages.senderId, userId),
        eq(directMessages.receiverId, userId)
      ))
      .orderBy(desc(directMessages.createdAt));

    const conversationMap = new Map<string, { recipientId: string; lastMessage: string; lastMessageAt: Date; unreadCount: number; jobId: number | null }>();

    for (const msg of allMessages) {
      const recipientId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      
      if (!conversationMap.has(recipientId)) {
        conversationMap.set(recipientId, {
          recipientId,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
          jobId: msg.jobId
        });
      }
      
      if (msg.receiverId === userId && !msg.read) {
        const conv = conversationMap.get(recipientId)!;
        conv.unreadCount++;
      }
    }

    const conversations = [];
    const entries = Array.from(conversationMap.entries());
    for (const [recipientId, conv] of entries) {
      const recipient = await this.getUser(recipientId);
      conversations.push({
        ...conv,
        recipientName: recipient?.name || recipient?.username || 'Unknown User'
      });
    }

    return conversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  async getDirectMessages(userId: string, otherUserId: string): Promise<DirectMessage[]> {
    return db.select().from(directMessages)
      .where(or(
        and(eq(directMessages.senderId, userId), eq(directMessages.receiverId, otherUserId)),
        and(eq(directMessages.senderId, otherUserId), eq(directMessages.receiverId, userId))
      ))
      .orderBy(directMessages.createdAt);
  }

  async sendDirectMessage(message: InsertDirectMessage): Promise<DirectMessage> {
    const [newMessage] = await db.insert(directMessages).values(message).returning();
    return newMessage;
  }

  async markDirectMessageRead(id: number): Promise<DirectMessage | undefined> {
    const [updated] = await db.update(directMessages)
      .set({ read: true })
      .where(eq(directMessages.id, id))
      .returning();
    return updated;
  }

  async markConversationRead(userId: string, otherUserId: string): Promise<void> {
    await db.update(directMessages)
      .set({ read: true })
      .where(and(
        eq(directMessages.senderId, otherUserId),
        eq(directMessages.receiverId, userId),
        eq(directMessages.read, false)
      ));
  }
}

export const storage = new DatabaseStorage();
