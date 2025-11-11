import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { IssueCard } from "@/components/IssueCard";
import { IssueModal } from "@/components/IssueModal";
import { IssueForm } from "@/components/IssueForm";
import { NoticeBoard } from "@/components/NoticeBoard";
import { Issue } from "@/contexts/DataContext";
import {
  Home,
  PlusCircle,
  Megaphone,
  LogOut,
  User,
  Search,
  ClipboardList,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
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

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { issues, notices, addIssue, deleteIssue } = useData();
  const [activeTab, setActiveTab] = useState<"all" | "my" | "notices">("all");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered data
  const myIssues = issues.filter((issue) => issue.createdBy === user?.name);
  const filteredIssues = issues.filter((issue) =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const total = issues.length;
  const pending = issues.filter((i) => i.status === "Pending").length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleView = (issue: Issue) => {
    setSelectedIssue(issue);
    setViewModalOpen(true);
  };

  const handleEdit = (issue: Issue) => {
    if (issue.status === "Resolved") {
      toast({
        title: "Cannot edit",
        description: "Resolved issues cannot be edited",
        variant: "destructive",
      });
      return;
    }
    setEditingIssue(issue);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setIssueToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!issueToDelete) return;
    const success = await deleteIssue(issueToDelete);
    toast({
      title: success ? "Issue deleted" : "Error",
      description: success
        ? "Your issue has been removed"
        : "Failed to delete issue",
      variant: success ? "default" : "destructive",
    });
    setDeleteDialogOpen(false);
    setIssueToDelete(null);
  };

  const handleNewIssue = () => {
    setEditingIssue(null);
    setFormModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary text-foreground">
      {/* Header */}
      <header className="border-b bg-card shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name} • Room {user?.roomNo}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Total Issues", value: total, icon: ClipboardList },
          { title: "Pending", value: pending, icon: Clock },
          { title: "Resolved", value: resolved, icon: CheckCircle2 },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl bg-card shadow-lg p-4 flex items-center justify-between hover:shadow-2xl transition-shadow"
          >
            <div>
              <h3 className="text-sm text-muted-foreground">{stat.title}</h3>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
            <stat.icon className="h-8 w-8 text-primary" />
          </motion.div>
        ))}
      </section>

      {/* Navigation Tabs */}
      <nav className="border-b mt-6 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-2">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              onClick={() => setActiveTab("all")}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              All Issues
            </Button>
            <Button
              variant={activeTab === "my" ? "default" : "ghost"}
              onClick={() => setActiveTab("my")}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              My Issues
            </Button>
            <Button
              variant={activeTab === "notices" ? "default" : "ghost"}
              onClick={() => setActiveTab("notices")}
              className="gap-2"
            >
              <Megaphone className="h-4 w-4" />
              Notice Board
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Search & Add */}
        {activeTab !== "notices" && (
          <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by issue title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={handleNewIssue}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Raise New Issue
            </Button>
          </div>
        )}

        {/* All Issues */}
        {activeTab === "all" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredIssues.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-12">
                No issues found.
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onView={handleView}
                  showActions={false}
                />
              ))
            )}
          </motion.div>
        )}

        {/* My Issues */}
        {activeTab === "my" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {myIssues.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-12">
                You haven't raised any issues yet.
              </div>
            ) : (
              myIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  showActions={true}
                />
              ))
            )}
          </motion.div>
        )}

        {/* Notices */}
        {activeTab === "notices" && <NoticeBoard notices={notices} />}
      </main>

      {/* Modals */}
      <IssueModal
        issue={selectedIssue}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />
      <IssueForm
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        issue={editingIssue}
        addIssue={addIssue}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Issue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this issue? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentDashboard;
