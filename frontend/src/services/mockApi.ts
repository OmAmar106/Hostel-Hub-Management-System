// Mock API service with simulated network latency
// TODO: Replace with actual backend API calls

import { users, issues, notices, categories, User, Issue, Notice } from './mockData';

const NETWORK_DELAY = 500; // Simulate network latency

// Simulated network delay
const delay = () => new Promise(resolve => setTimeout(resolve, NETWORK_DELAY));

// In-memory data store
let usersStore = [...users];
let issuesStore = [...issues];
let noticesStore = [...notices];

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<User | null> {
    await delay();
    // TODO: Replace with actual backend authentication
    const user = usersStore.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }
    return null;
  },

  async signup(userData: Omit<User, 'id'>): Promise<User> {
    await delay();
    // TODO: Replace with actual backend user creation
    const newUser: User = {
      ...userData,
      id: `s${Date.now()}`,
    };
    usersStore.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword as User;
  },
};

// Issues API
export const issuesApi = {
  async getAll(): Promise<Issue[]> {
    await delay();
    // TODO: Replace with actual backend API call
    return issuesStore.filter(i => i.status !== 'Cancelled');
  },

  async getById(id: string): Promise<Issue | null> {
    await delay();
    // TODO: Replace with actual backend API call
    return issuesStore.find(i => i.id === id) || null;
  },

  async getByStudentId(studentId: string): Promise<Issue[]> {
    await delay();
    // TODO: Replace with actual backend API call
    return issuesStore.filter(i => i.studentId === studentId && i.status !== 'Cancelled');
  },

  async getByRepairerId(repairerId: string): Promise<Issue[]> {
    await delay();
    // TODO: Replace with actual backend API call
    return issuesStore.filter(i => i.assignedRepairerId === repairerId);
  },

  async create(issueData: Omit<Issue, 'id' | 'upvotes' | 'voters' | 'postedDate'>): Promise<Issue> {
    await delay();
    // TODO: Replace with actual backend API call
    const newIssue: Issue = {
      ...issueData,
      id: `i${Date.now()}`,
      postedDate: new Date().toISOString(),
      upvotes: 0,
      voters: [],
    };
    issuesStore.push(newIssue);
    return newIssue;
  },

  async update(id: string, updates: Partial<Issue>): Promise<Issue | null> {
    await delay();
    // TODO: Replace with actual backend API call with RBAC checks
    const index = issuesStore.findIndex(i => i.id === id);
    if (index !== -1) {
      issuesStore[index] = { ...issuesStore[index], ...updates };
      return issuesStore[index];
    }
    return null;
  },

  async delete(id: string): Promise<boolean> {
    await delay();
    // TODO: Replace with actual backend API call with RBAC checks
    // Soft delete: mark as cancelled rather than removing from array
    const index = issuesStore.findIndex(i => i.id === id);
    if (index !== -1) {
      issuesStore[index].status = 'Cancelled';
      return true;
    }
    return false;
  },

  async upvote(issueId: string, userId: string): Promise<Issue | null> {
    await delay();
    // TODO: Replace with actual backend API call
    const issue = issuesStore.find(i => i.id === issueId);
    if (issue && !issue.voters.includes(userId)) {
      issue.voters.push(userId);
      issue.upvotes += 1;
      return issue;
    }
    return null;
  },

  async downvote(issueId: string, userId: string): Promise<Issue | null> {
    await delay();
    // TODO: Replace with actual backend API call
    const issue = issuesStore.find(i => i.id === issueId);
    if (issue && issue.voters.includes(userId)) {
      issue.voters = issue.voters.filter(v => v !== userId);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
      return issue;
    }
    return null;
  },
};

// Notices API
export const noticesApi = {
  async getAll(): Promise<Notice[]> {
    await delay();
    // TODO: Replace with actual backend API call
    return noticesStore.filter(n => n.isPublic);
  },

  async getById(id: string): Promise<Notice | null> {
    await delay();
    // TODO: Replace with actual backend API call
    return noticesStore.find(n => n.id === id) || null;
  },

  async create(noticeData: Omit<Notice, 'id' | 'postedDate'>): Promise<Notice> {
    await delay();
    // TODO: Replace with actual backend API call with admin RBAC check
    const newNotice: Notice = {
      ...noticeData,
      id: `n${Date.now()}`,
      postedDate: new Date().toISOString(),
    };
    noticesStore.push(newNotice);
    return newNotice;
  },

  async update(id: string, updates: Partial<Notice>): Promise<Notice | null> {
    await delay();
    // TODO: Replace with actual backend API call with admin RBAC check
    const index = noticesStore.findIndex(n => n.id === id);
    if (index !== -1) {
      noticesStore[index] = { ...noticesStore[index], ...updates };
      return noticesStore[index];
    }
    return null;
  },

  async delete(id: string): Promise<boolean> {
    await delay();
    // TODO: Replace with actual backend API call with admin RBAC check
    const index = noticesStore.findIndex(n => n.id === id);
    if (index !== -1) {
      noticesStore.splice(index, 1);
      return true;
    }
    return false;
  },
};

// Users API (for admin)
export const usersApi = {
  async getAll(): Promise<User[]> {
    await delay();
    // TODO: Replace with actual backend API call with admin RBAC check
    return usersStore.map(({ password, ...user }) => user as User);
  },

  async getRepairers(): Promise<User[]> {
    await delay();
    // TODO: Replace with actual backend API call
    return usersStore.filter(u => u.role === 'repairer').map(({ password, ...user }) => user as User);
  },
};

// Categories API
export const categoriesApi = {
  async getAll() {
    await delay();
    // TODO: Replace with actual backend API call
    return categories;
  },
};
