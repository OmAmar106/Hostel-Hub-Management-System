import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const API_BASE = "http://localhost:5000";

export interface Category {
  id: string;
  name: string;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  roomNumber: string;
  status: "Pending" | "In Progress" | "Resolved";
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

export interface Repairer {
  id: string;
  name: string;
}

interface DataContextType {
  issues: Issue[];
  notices: Notice[];
  categories: Category[];
  repairers: Repairer[];
  loading: boolean;
  addIssue: (issue: any) => Promise<void>;
  addNotice: (notice: any) => Promise<void>;
  updateIssue: (issueId: number, updates: Partial<Issue>) => Promise<void>;
  deleteIssue: (issueId: number) => Promise<boolean>;
  deleteNotice: (noticeId: number) => Promise<boolean>;
  upvoteIssue: (issueId: number) => Promise<void>;
  downvoteIssue: (issueId: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [issuesRes, categoriesRes, noticesRes] = await Promise.all([
        fetch(`${API_BASE}/api/issues`, { headers }),
        fetch(`${API_BASE}/api/categories`, { headers }),
        fetch(`${API_BASE}/api/notices`, { headers }),
      ]);

      if (!issuesRes.ok || !categoriesRes.ok || !noticesRes.ok)
        throw new Error("Failed to fetch data");

      setIssues(await issuesRes.json());
      setCategories(await categoriesRes.json());
      setNotices(await noticesRes.json());
      setRepairers([
        { id: "r1", name: "Repairer Mike" },
        { id: "r2", name: "Repairer Tom" },
      ]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data from server");
    } finally {
      setLoading(false);
    }
  };

  // Issue Operations
  const addIssue = async (issueData: any) => {
    try {
      const res = await fetch(`${API_BASE}/api/issues`, {
        method: "POST",
        headers,
        body: JSON.stringify(issueData),
      });
      if (!res.ok) throw new Error();
      await fetchAllData();
      toast.success("Issue reported successfully!");
    } catch {
      toast.error("Failed to report issue");
    }
  };

  const updateIssue = async (issueId: number, updates: Partial<Issue>) => {
    try {
      const res = await fetch(`${API_BASE}/api/issues/${issueId}/status`, {
        method: "POST",
        headers,
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      await fetchAllData();
      toast.success("Issue updated");
    } catch {
      toast.error("Failed to update issue");
    }
  };

  const deleteIssue = async (issueId: number) => {
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
    toast.info("Issue deleted locally (backend deletion not implemented)");
    return true;
  };

  const upvoteIssue = async (issueId: number) => {
    try {
      await fetch(`${API_BASE}/api/issues/${issueId}/upvote`, {
        method: "POST",
        headers,
      });
      await fetchAllData();
    } catch {
      toast.error("Failed to upvote");
    }
  };

  const downvoteIssue = async () => {
    toast.info("Downvote not supported on backend yet");
  };

  // Notice Operations
  const addNotice = async (noticeData: any) => {
    try {
      const res = await fetch(`${API_BASE}/api/notices`, {
        method: "POST",
        headers,
        body: JSON.stringify(noticeData),
      });
      if (!res.ok) throw new Error();
      await fetchAllData();
      toast.success("Notice created successfully!");
    } catch {
      toast.error("Failed to create notice");
    }
  };

  const deleteNotice = async (noticeId: number) => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    toast.info("Notice deleted locally (backend deletion not implemented)");
    return true;
  };

  useEffect(() => {
    if (token) fetchAllData();
  }, [token]);

  return (
    <DataContext.Provider
      value={{
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
};
