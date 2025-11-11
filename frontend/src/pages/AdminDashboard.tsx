import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { IssueModal } from "@/components/IssueModal";
import { NoticeForm } from "@/components/NoticeForm";
import { Issue, Notice } from "@/contexts/DataContext";
import {
  ClipboardList,
  Wrench,
  Megaphone,
  LogOut,
  Edit,
  Trash2,
  Eye,
  Plus,
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
import ThemeToggle from "@/components/ui/ThemeToggle"; // ✅ Added import

const API_BASE = "http://localhost:5000";

const AdminDashboard = () => {
  const [workerFormOpen, setWorkerFormOpen] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { issues, notices, addNotice, updateIssue, deleteNotice } = useData();

  const [activeTab, setActiveTab] = useState<"issues" | "notices" | "workers">(
    "issues"
  );
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [noticeFormOpen, setNoticeFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<number | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleView = (issue: Issue) => {
    setSelectedIssue(issue);
    setViewModalOpen(true);
  };

  const handleStatusChange = async (
    issueId: number,
    newStatus: Issue["status"]
  ) => {
    const updates: Partial<Issue> = { status: newStatus };
    await updateIssue(issueId, updates);
    toast({
      title: "Status updated",
      description: `Issue status changed to ${newStatus}`,
    });
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
    if (success) {
      toast({
        title: "Notice deleted",
        description: "Notice has been removed",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete notice",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setNoticeToDelete(null);
  };

  const handleNewNotice = () => {
    setEditingNotice(null);
    setNoticeFormOpen(true);
  };

  // --- Fetch workers list from backend ---
  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/workers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch workers");
      const data = await res.json();
      setWorkers(data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching workers",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (activeTab === "workers") fetchWorkers();
  }, [activeTab, workerFormOpen]);

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

            {/* ✅ Dark/Light Mode Toggle Button */}
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
            <Button
              variant={activeTab === "issues" ? "default" : "ghost"}
              onClick={() => setActiveTab("issues")}
              className="gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              All Complaints
            </Button>
            <Button
              variant={activeTab === "notices" ? "default" : "ghost"}
              onClick={() => setActiveTab("notices")}
              className="gap-2"
            >
              <Megaphone className="h-4 w-4" />
              Manage Notices
            </Button>
            <Button
              variant={activeTab === "workers" ? "default" : "ghost"}
              onClick={() => setActiveTab("workers")}
              className="gap-2"
            >
              <Wrench className="h-4 w-4" />
              Manage Workers
            </Button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
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
                        <TableHead>Upvotes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.map((issue) => (
                        <TableRow key={issue.id}>
                          <TableCell>{issue.id}</TableCell>
                          <TableCell>{issue.createdBy}</TableCell>
                          <TableCell>{issue.roomNumber}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {issue.title}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={issue.status}
                              onValueChange={(v) =>
                                handleStatusChange(issue.id, v as Issue["status"])
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{issue.upvotes}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(issue)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                          Posted:{" "}
                          {new Date(notice.createdAt).toLocaleDateString()}
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
                <Plus className="h-4 w-4 mr-2" />
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
              Are you sure you want to delete this notice? This action cannot be
              undone.
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
