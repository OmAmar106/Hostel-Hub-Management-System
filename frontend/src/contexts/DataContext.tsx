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
  status: "Pending" | "In Progress" | "Resolved" | "Cancelled";
  createdBy: string;
  createdAt: string;
  upvotes: number;
  voters: string[];
  assignee: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface MessItem {
  id: number;
  day: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Repairer {
  id: string;
  name: string;
}

interface DataContextType {
  issues: Issue[];
  notices: Notice[];
  messItems: MessItem[];
  categories: Category[];
  repairers: Repairer[];
  loading: boolean;
  addIssue: (issue: any) => Promise<void>;
  addNotice: (notice: any) => Promise<void>;
  addMessItem: (messItem: any) => Promise<void>;
  updateIssue: (issueId: number, updates: Partial<Issue>) => Promise<void>;
  updateMessItem: (messId: number, updates: Partial<MessItem>) => Promise<void>;
  deleteIssue: (issueId: number) => Promise<boolean>;
  deleteNotice: (noticeId: number) => Promise<boolean>;
  deleteMessItem: (messId: number) => Promise<boolean>;
  upvoteIssue: (issueId: number) => Promise<void>;
  downvoteIssue: (issueId: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [messItems, setMessItems] = useState<MessItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [issuesRes, categoriesRes, noticesRes, workersRes, messRes] = await Promise.all([
        fetch(`${API_BASE}/api/issues`, { headers }),
        fetch(`${API_BASE}/api/categories`, { headers }),
        fetch(`${API_BASE}/api/notices`, { headers }),
        fetch(`${API_BASE}/api/workers`, { headers }),
        fetch(`${API_BASE}/api/mess`, { headers }),
      ]);

      if ([issuesRes, categoriesRes, noticesRes, workersRes, messRes].some(r => r.status === 401 || r.status === 422)) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      if (![issuesRes.ok, categoriesRes.ok, noticesRes.ok, workersRes.ok, messRes.ok].every(Boolean))
        throw new Error("Failed to fetch some resources");

      const [issuesData, categoriesData, noticesData, workersData, messData] = await Promise.all([
        issuesRes.json(),
        categoriesRes.json(),
        noticesRes.json(),
        workersRes.json(),
        messRes.json(),
      ]);

      setIssues(issuesData);
      setCategories(categoriesData);
      setNotices(noticesData);
      console.log(workersData)
      const repairerList = workersData.filter((w: any) => w.role === "worker");
      // console.log(repairerList)
      setRepairers(repairerList);
    } catch (err) {
      console.error("fetchAllData error:", err);
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
    try {
      const res = await fetch(`${API_BASE}/api/issues/${issueId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        // show message from server if present
        let msg = "Failed to delete issue";
        try {
          const json = await res.json();
          if (json?.error) msg = json.error;
        } catch {}
        toast.error(msg);
        return false;
      }

      // re-fetch authoritative data
      await fetchAllData();
      toast.success("Issue deleted");
      return true;
    } catch (err) {
      console.error("deleteIssue error:", err);
      toast.error("Failed to delete issue");
      return false;
    }
  };

  const upvoteIssue = async (issueId: number) => {
    if (!user) {
      toast.error("Please login to upvote");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/issues/${issueId}/upvote`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error();
      await fetchAllData();
    } catch (err) {
      console.error("upvoteIssue error:", err);
      toast.error("Failed to upvote");
    }
  };

  const downvoteIssue = async (issueId: number) => {
    if (!user) {
      toast.error("Please login to downvote");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/issues/${issueId}/downvote`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error();
      await fetchAllData();
    } catch (err) {
      console.error("downvoteIssue error:", err);
      toast.error("Failed to downvote");
    }
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
    try {
      const res = await fetch(`${API_BASE}/api/notices/${noticeId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        let msg = "Failed to delete notice";
        try {
          const json = await res.json();
          if (json?.error) msg = json.error;
        } catch {}
        toast.error(msg);
        return false;
      }

      await fetchAllData();
      toast.success("Notice deleted");
      return true;
    } catch (err) {
      console.error("deleteNotice error:", err);
      toast.error("Failed to delete notice");
      return false;
    }
  };

  // Mess Operations
  const addMessItem = async (messData: any) => {
    try {
      const res = await fetch(`${API_BASE}/api/mess`, {
        method: "POST",
        headers,
        body: JSON.stringify(messData),
      });
      if (!res.ok) throw new Error();
      await fetchAllData();
      toast.success("Mess item created successfully!");
    } catch {
      toast.error("Failed to create mess item");
    }
  };

  const updateMessItem = async (messId: number, updates: Partial<MessItem>) => {
    try {
      const res = await fetch(`${API_BASE}/api/mess/${messId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      await fetchAllData();
      toast.success("Mess item updated successfully!");
    } catch {
      toast.error("Failed to update mess item");
    }
  };

  const deleteMessItem = async (messId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/mess/${messId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        let msg = "Failed to delete mess item";
        try {
          const json = await res.json();
          if (json?.error) msg = json.error;
        } catch {}
        toast.error(msg);
        return false;
      }

      await fetchAllData();
      toast.success("Mess item deleted");
      return true;
    } catch (err) {
      console.error("deleteMessItem error:", err);
      toast.error("Failed to delete mess item");
      return false;
    }
  };

  useEffect(() => {
    // fetch data if token exists (logged in) or, optionally, always fetch public data
    if (token) fetchAllData();
  }, [token]);

  return (
    <DataContext.Provider
      value={{
        issues,
        notices,
        messItems,
        categories,
        repairers,
        loading,
        addIssue,
        addNotice,
        addMessItem,
        updateIssue,
        updateMessItem,
        deleteIssue,
        deleteNotice,
        deleteMessItem,
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
