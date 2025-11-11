import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { IssueCard } from '@/components/IssueCard';
import { IssueModal } from '@/components/IssueModal';
import { IssueForm } from '@/components/IssueForm';
import { NoticeBoard } from '@/components/NoticeBoard';
import { MessBoard } from '@/components/MessBoard';
import { Issue } from '@/contexts/DataContext';
import { Home, PlusCircle, Megaphone, LogOut, User, UtensilsCrossed } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ProfileAvatar from "@/components/ui/ProfileAvatar";
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
import ThemeToggle from "@/components/ui/ThemeToggle"; // ✅ Import the theme toggle

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { issues, notices, messItems, addIssue, deleteIssue } = useData();
  const [activeTab, setActiveTab] = useState<"all" | "my" | "notices" | "mess">("all");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<number | null>(null);

  // 🔹 Filter issues belonging to current user
  const myIssues = issues.filter((issue) => issue.createdBy === user?.name);

  // 🔹 Logout handler
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // 🔹 View issue details
  const handleView = (issue: Issue) => {
    setSelectedIssue(issue);
    setViewModalOpen(true);
  };

  // 🔹 Edit issue
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

  // 🔹 Delete confirmation
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

  // 🔹 Open new issue form
  const handleNewIssue = () => {
    setEditingIssue(null);
    setFormModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Student Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <ProfileAvatar />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-white dark:bg-gray-800 dark:border-gray-700">
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
              {/* using icon from lucide-react */}
              <PlusCircle className="h-4 w-4" />
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
            <Button
              variant={activeTab === "mess" ? "default" : "ghost"}
              onClick={() => setActiveTab("mess")}
              className="gap-2"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Mess Menu
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* 🔹 All Issues */}
        {activeTab === "all" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                All Issues
              </h2>
              <Button onClick={handleNewIssue}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Raise New Issue
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} onView={handleView} showActions={false} />
              ))}
            </div>
          </div>
        )}

        {/* 🔹 My Issues */}
        {activeTab === "my" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                My Issues
              </h2>
              <Button onClick={handleNewIssue}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Raise New Issue
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myIssues.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                  You haven't raised any issues yet
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
            </div>
          </div>
        )}

        {/* 🔹 Notices */}
        {activeTab === "notices" && <NoticeBoard notices={notices} />}

        {/* 🔹 Mess Menu */}
        {activeTab === "mess" && <MessBoard messItems={messItems} />}
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
