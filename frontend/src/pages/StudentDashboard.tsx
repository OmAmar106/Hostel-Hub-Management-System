import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { IssueCard } from '@/components/IssueCard';
import { IssueModal } from '@/components/IssueModal';
import { IssueForm } from '@/components/IssueForm';
import { NoticeBoard } from '@/components/NoticeBoard';
import { Issue } from '@/contexts/DataContext';
import { Home, PlusCircle, Megaphone, LogOut, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { issues, notices, addIssue, deleteIssue } = useData();
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'notices'>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<number | null>(null);

  // TODO: Backend should filter issues based on user role and permissions
  const myIssues = issues.filter(issue => issue.createdBy === user?.name); // Assuming createdBy stores the user's name

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleView = (issue: Issue) => {
    setSelectedIssue(issue);
    setViewModalOpen(true);
  };

  const handleEdit = (issue: Issue) => {
    // TODO: Backend should verify ownership before allowing edit
    if (issue.status === 'Resolved') {
      toast({
        title: 'Cannot edit',
        description: 'Resolved issues cannot be edited',
        variant: 'destructive',
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
    
    // TODO: Backend should verify ownership before allowing delete
    const success = await deleteIssue(issueToDelete);
    if (success) {
      toast({
        title: 'Issue deleted',
        description: 'Your issue has been removed',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete issue',
        variant: 'destructive',
      });
    }
    setDeleteDialogOpen(false);
    setIssueToDelete(null);
  };

  const handleNewIssue = () => {
    setEditingIssue(null);
    setFormModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
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

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('all')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              All Issues
            </Button>
            <Button
              variant={activeTab === 'my' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('my')}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              My Issues
            </Button>
            <Button
              variant={activeTab === 'notices' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('notices')}
              className="gap-2"
            >
              <Megaphone className="h-4 w-4" />
              Notice Board
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'all' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">All Issues</h2>
              <Button onClick={handleNewIssue}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Raise New Issue
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onView={handleView}
                  showActions={false}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">My Issues</h2>
              <Button onClick={handleNewIssue}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Raise New Issue
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myIssues.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
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

        {activeTab === 'notices' && (
          <NoticeBoard notices={notices} />
        )}
      </main>

      {/* Modals */}
      <IssueModal issue={selectedIssue} open={viewModalOpen} onOpenChange={setViewModalOpen} />
      <IssueForm
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        issue={editingIssue}
        addIssue={addIssue} // Pass the function as a prop
          // We need to get fetchIssues from useData() too
/>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Issue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this issue? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentDashboard;
