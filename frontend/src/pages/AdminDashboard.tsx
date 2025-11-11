import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { IssueModal } from "@/components/IssueModal";
import { NoticeForm } from "@/components/NoticeForm";
import { MessForm } from "@/components/MessForm";
import { Issue, Notice } from "@/contexts/DataContext";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import {
  ClipboardList,
  Wrench,
  Megaphone,
  LogOut,
  Edit,
  Trash2,
  Eye,
  Plus,
  UserPlus,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkerForm } from "@/components/WorkerForm";
import ThemeToggle from "@/components/ui/ThemeToggle";

const API_BASE = "http://localhost:5000";

const AdminDashboard = () => {
  const [workerFormOpen, setWorkerFormOpen] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { issues, notices, messItems, addNotice, updateIssue, deleteNotice, addMessItem, updateMessItem, deleteMessItem } = useData();

  const [activeTab, setActiveTab] = useState<"issues" | "notices" | "workers" | "mess">("issues");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [noticeFormOpen, setNoticeFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<number | null>(null);

  // 🔹 Logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // 🔹 Open issue modal
  const handleView = (issue: Issue) => {
    setSelectedIssue(issue);
    setViewModalOpen(true);
  };

  // 🔹 Update issue status
  const handleStatusChange = async (issueId: number, newStatus: Issue["status"]) => {
    try {
      const res = await fetch(`${API_BASE}/api/issues/${issueId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast({
        title: "Status Updated",
        description: `Issue marked as ${newStatus}`,
      });
      await updateIssue(issueId, { status: newStatus });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive",
      });
    }
  };

  const handleAssignWorker = async (issueId: number, workerId: number) => {
  try {
    const token = localStorage.getItem("access_token");

    const res = await fetch(`${API_BASE}/api/issues/${issueId}/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ worker_id: workerId }), // 👈 use correct key
    });

    console.debug("Assign response status:", res.status);
    let payload = null;
    try {
      payload = await res.json();
      console.debug("Assign response body:", payload);
    } catch {
      console.debug("No JSON response from backend");
    }

    if (!res.ok) {
      const serverMsg = payload?.error || payload?.message || `HTTP ${res.status}`;
      toast({
        title: "Failed to assign",
        description: serverMsg,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Assigned Successfully",
      description: "Worker assigned to issue.",
    });

    // Refresh the page or data so UI updates
    window.location.reload(); // 👈 temporary refresh until we expose fetchAllData
  } catch (err) {
    console.error("Error assigning worker:", err);
    toast({
      title: "Error",
      description: "Could not assign worker.",
      variant: "destructive",
    });
  }
};


  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setNoticeFormOpen(true);
  };

  const handleDeleteNoticeClick = (noticeId: number) => {
    setNoticeToDelete(noticeId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteNotice = async () => {
    if (!noticeToDelete) return;
    const success = await deleteNotice(noticeToDelete);
    toast({
      title: success ? "Notice Deleted" : "Error",
      description: success ? "Notice has been removed" : "Failed to delete notice",
      variant: success ? "default" : "destructive",
    });
    setDeleteDialogOpen(false);
    setNoticeToDelete(null);
  };

  const handleNewNotice = () => {
    setEditingNotice(null);
    setNoticeFormOpen(true);
  };

  // 🔹 Fetch workers
  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/workers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch workers");
      setWorkers(await res.json());
    } catch {
      toast({
        title: "Error fetching workers",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [activeTab, workerFormOpen]);

  // helper for safe string comparison
  const normalize = (s?: any) => (s === undefined || s === null ? "" : String(s).trim().toLowerCase());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {user?.name} (Admin)
            </span>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-2">
            {(["issues", "notices", "workers", "mess"] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                onClick={() => setActiveTab(tab)}
                className="gap-2"
              >
                {tab === "issues" && <ClipboardList className="h-4 w-4" />}
                {tab === "notices" && <Megaphone className="h-4 w-4" />}
                {tab === "workers" && <Wrench className="h-4 w-4" />}
                {tab === "mess" && <UtensilsCrossed className="h-4 w-4" />}
                {tab === "issues"
                  ? "All Complaints"
                  : tab === "notices"
                    ? "Manage Notices"
                    : tab === "workers"
                    ? "Manage Workers"
                    : "Manage Mess"}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        {/* ISSUES */}
        {activeTab === "issues" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              All Complaints
            </h2>
            <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assign</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues
                        .sort((a, b) => (a.assignee ? 1 : -1))
                        .map((issue) => {
                          // ---------- robust matching & debug logs ----------
                          // Debug logs — remove these once you confirm fields are correct
                          // (Open DevTools console to inspect)
                          console.debug("DEBUG issue:", issue);
                          // show only a small sample to avoid huge logs
                          console.debug("DEBUG workers sample:", workers.slice(0, 8));

                          // collect possible category-like values from the issue object
                          const possibleIssueCategories = new Set<string>(
                            [
                              normalize((issue as any).category),
                              normalize((issue as any).categoryName),
                              normalize((issue as any).type),
                              normalize((issue as any).issue_type),
                              normalize((issue as any).worker_type),
                              normalize((issue as any).ticket_category),
                              normalize((issue as any).category_id),
                              normalize((issue as any).categoryId),
                              normalize((issue as any).title), // last resort
                            ].filter(Boolean)
                          );

                          // If still empty, try looking into description for hints (debug only)
                          if (possibleIssueCategories.size === 0) {
                            const desc = normalize((issue as any).description || "");
                            if (desc) {
                              // take first few words as a candidate — debug only
                              const firstWords = desc.split(" ").slice(0, 3).join(" ");
                              possibleIssueCategories.add(firstWords);
                            }
                          }

                          // build candidates by flexible matching
                          const candidates = workers.filter((w) => {
                            const workerType = normalize(
                              (w as any).worker_type ||
                              (w as any).type ||
                              (w as any).category ||
                              (w as any).workerType
                            );
                            const workerName = normalize((w as any).name || (w as any).full_name || (w as any).email || "");
                            const workerIdStr = normalize((w as any).id);

                            for (const ic of possibleIssueCategories) {
                              if (!ic) continue;
                              // exact match
                              if (workerType && workerType === ic) return true;
                              // partial contains
                              if (workerType && (ic.includes(workerType) || workerType.includes(ic))) return true;
                              // id match fallback
                              if (workerIdStr && workerIdStr === ic) return true;
                              // name in category (rare)
                              if (workerName && ic.includes(workerName)) return true;
                            }
                            return false;
                          });

                          if (candidates.length === 0) {
                            console.warn(
                              `No worker candidates for issue id=${issue.id}. possibleIssueCategories=`,
                              Array.from(possibleIssueCategories).slice(0, 6)
                            );
                          }
                          // ---------- end matching ----------
                          return (
                            <TableRow key={issue.id}>
                              <TableCell>{issue.id}</TableCell>
                              <TableCell>{issue.createdBy}</TableCell>
                              <TableCell>{issue.roomNumber}</TableCell>
                              <TableCell className="max-w-xs truncate">{issue.title}</TableCell>

                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {issue.status === "Resolved" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : issue.status === "In Progress" ? (
                                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-red-500" />
                                  )}
                                  <span
                                    className={
                                      issue.status === "Resolved"
                                        ? "text-green-600 font-medium"
                                        : issue.status === "In Progress"
                                          ? "text-blue-600 font-medium"
                                          : "text-red-600 font-medium"
                                    }
                                  >
                                    {issue.status}
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell>
                                {issue.assignee ? (
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500 italic">
                                      Assigned to{" "}
                                      <strong>
                                        {workers.find((w) => String(w.id) === String(issue.assignee))?.name ||
                                          "Unknown"}
                                      </strong>
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-800"
                                      onClick={async () => {
                                        // Confirm before unassigning
                                        if (!confirm("Unassign this worker?")) return;

                                        try {
                                          const res = await fetch(`${API_BASE}/api/issues/${issue.id}/unassign`, {
                                            method: "POST",
                                            headers: {
                                              "Content-Type": "application/json",
                                              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                                            },
                                          });
                                          if (!res.ok) throw new Error("Failed to unassign");
                                          toast({
                                            title: "Worker Unassigned",
                                            description: "You can now assign this issue again.",
                                          });
                                          await updateIssue(issue.id, {} as any);
                                        } catch {
                                          toast({
                                            title: "Error",
                                            description: "Failed to unassign worker.",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    >
                                      Edit
                                    </Button>
                                  </div>
                                ) : (
                                  <Select onValueChange={(v) => handleAssignWorker(issue.id, Number(v))}>
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Assign Worker" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {candidates.length === 0 ? (
                                        <div className="p-3 text-sm text-gray-500">No workers available for this category</div>
                                      ) : (
                                        candidates.map((w) => (
                                          <SelectItem key={w.id} value={String(w.id)}>
                                            {w.name || w.full_name || w.email}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>

                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => handleView(issue)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "notices" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Manage Notices
              </h2>
              <Button onClick={handleNewNotice}>
                <Plus className="h-4 w-4 mr-2" />
                Create Notice
              </Button>
            </div>
            <div className="grid gap-4">
              {notices.map((notice) => (
                <Card
                  key={notice.id}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{notice.title}</CardTitle>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Posted: {new Date(notice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditNotice(notice)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteNoticeClick(notice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {notice.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "workers" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Manage Workers
              </h2>
              <Button onClick={() => setWorkerFormOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Worker
              </Button>
            </div>
            <div className="grid gap-4">
              {workers.map((worker) => (
                <Card
                  key={worker.id}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{worker.name}</CardTitle>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        ID: {worker.id}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {worker.email} —{" "}
                      <span className="font-medium">
                        {worker.worker_type || "General"}
                      </span>
                    </p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* MESS */}
        {activeTab === "mess" && (
          <MessForm 
            messItems={messItems}
            onAdd={addMessItem}
            onUpdate={updateMessItem}
          />
        )}
      </main>

      {/* Modals */}
      <IssueModal
        issue={selectedIssue}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />
      <WorkerForm open={workerFormOpen} onOpenChange={setWorkerFormOpen} />
      <NoticeForm
        open={noticeFormOpen}
        onOpenChange={setNoticeFormOpen}
        addNotice={addNotice}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteNotice}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
