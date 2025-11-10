// src/contexts/DataContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

const API_BASE_URL = '';

// --- INTERFACES ---
// These are our official data structures now.
export interface Category {
  id: string;
  name: string;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  roomNumber: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  createdBy: string;
  createdAt: string;
  upvotes: number;
  voters: string[];
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

// A simple type for repairers for now
export interface Repairer {
  id: string;
  name: string;
}

// --- CONTEXT TYPE DEFINITION ---
// We define EVERYTHING the app might need from this context.
interface DataContextType {
  issues: Issue[];
  notices: Notice[];
  categories: Category[];
  repairers: Repairer[]; // Added repairers
  loading: boolean;
  addIssue: (issue: any) => Promise<void>;
  addNotice: (notice: any) => Promise<void>;
  updateIssue: (issueId: number, updates: Partial<Issue>) => Promise<void>; // Added
  deleteIssue: (issueId: number) => Promise<boolean>; // Added
  deleteNotice: (noticeId: number) => Promise<boolean>; // Added
  upvoteIssue: (issueId: number, userId: string) => Promise<void>; // Added
  downvoteIssue: (issueId: number, userId: string) => Promise<void>; // Added
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [repairers, setRepairers] = useState<Repairer[]>([]); // Added state for repairers
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [issuesRes, categoriesRes, noticesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/issues`),
        fetch(`${API_BASE_URL}/api/categories`),
        fetch(`${API_BASE_URL}/api/notices`),
      ]);

      if (!issuesRes.ok || !categoriesRes.ok || !noticesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const issuesData = await issuesRes.json();
      const categoriesData = await categoriesRes.json();
      const noticesData = await noticesRes.json();
      
      setIssues(issuesData);
      setCategories(categoriesData);
      setNotices(noticesData);
      // For now, repairers are mock data
      setRepairers([{ id: 'r1', name: 'Repairer Mike' }, { id: 'r2', name: 'Repairer Tom' }]);

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data from the server.");
    } finally {
      setLoading(false);
    }
  };
  
  const addIssue = async (issueData: any) => {
    // This function is already correct
    try {
      const response = await fetch(`${API_BASE_URL}/api/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData),
      });
      if (!response.ok) throw new Error('Failed to create issue');
      const result = await response.json();
      setIssues(prev => [result.issue, ...prev]);
      toast.success(result.message || 'Issue reported successfully!');
    } catch (error) {
      toast.error("Failed to report issue.");
      throw error;
    }
  };

  const addNotice = async (noticeData: any) => {
    // This function is also correct
    try {
      const response = await fetch(`${API_BASE_URL}/api/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noticeData),
      });
      if (!response.ok) throw new Error('Failed to create notice');
      const result = await response.json();
      setNotices(prev => [result.notice, ...prev]);
      toast.success(result.message || 'Notice created successfully!');
    } catch (error) {
      toast.error("Failed to create notice.");
      throw error;
    }
  };

  // --- PLACEHOLDER FUNCTIONS ---
  // We add these functions so other components don't crash.
  // We will implement their backend logic later.
  const updateIssue = async (issueId: number, updates: Partial<Issue>) => {
    console.log("TODO: updateIssue", issueId, updates);
    toast.info("Update issue functionality is not yet implemented.");
    // Example of how it would work:
    // const issue = issues.find(i => i.id === issueId);
    // if (issue) setIssues(issues.map(i => i.id === issueId ? { ...i, ...updates } : i));
  };
  
  const deleteIssue = async (issueId: number): Promise<boolean> => {
    console.log("TODO: deleteIssue", issueId);
    toast.info("Delete issue functionality is not yet implemented.");
    return false;
  };
  
  const deleteNotice = async (noticeId: number): Promise<boolean> => {
    console.log("TODO: deleteNotice", noticeId);
    toast.info("Delete notice functionality is not yet implemented.");
    return false;
  };
  
  const upvoteIssue = async (issueId: number, userId: string) => {
    console.log("TODO: upvoteIssue", issueId, userId);
    toast.info("Upvote functionality is not yet implemented.");
  };

  const downvoteIssue = async (issueId: number, userId: string) => {
    console.log("TODO: downvoteIssue", issueId, userId);
    toast.info("Downvote functionality is not yet implemented.");
  };
  
  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <DataContext.Provider value={{
      issues,
      notices,
      categories,
      repairers,
      loading,
      addIssue,
      addNotice,
      updateIssue,
      deleteIssue,
      deleteNotice,
      upvoteIssue,
      downvoteIssue,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};