import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { IssueModal } from '@/components/IssueModal';
import { NoticeForm } from '@/components/NoticeForm';
import { StatusBadge } from '@/components/StatusBadge';
import { Issue, Notice } from '@/contexts/DataContext';
import { ClipboardList, Wrench, Megaphone, LogOut, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { issues, notices, categories, addNotice,repairers, updateIssue, deleteNotice } = useData();
  const [activeTab, setActiveTab] = useState<'issues' | 'notices'>('issues');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [noticeFormOpen, setNoticeFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<number | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleView = (issue: Issue) => {
    setSelectedIssue(issue);
    setViewModalOpen(true);
  };

  const handleStatusChange = async (issueId: number, newStatus: Issue['status']) => {
    // TODO: Backend should verify admin role before allowing status update
    const updates: Partial<Issue> = { status: newStatus };
    await updateIssue(issueId, updates);
    toast({
      title: 'Status updated',
      description: `Issue status changed to ${newStatus}`,
    });
  };

  // Removed repairer assignment as current Issue type does not include it

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
    
    // TODO: Backend should verify admin role before allowing delete
    const success = await deleteNotice(noticeToDelete);
    if (success) {
      toast({
        title: 'Notice deleted',
        description: 'Notice has been removed',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete notice',
        variant: 'destructive',
      });
    }
    setDeleteDialogOpen(false);
    setNoticeToDelete(null);
  };

  const handleNewNotice = () => {
    setEditingNotice(null);
    setNoticeFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name} (Admin)</span>
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
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'issues' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('issues')}
              className="gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              All Complaints
            </Button>
            <Button
              variant={activeTab === 'notices' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('notices')}
              className="gap-2"
            >
              <Megaphone className="h-4 w-4" />
              Manage Notices
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'issues' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">All Complaints</h2>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Room</TableHead>
                        {/* Category removed: not present on Issue */}
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        {/* Repairer removed: not present on Issue */}
                        <TableHead>Upvotes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.map((issue) => {
                        // Removed category and repairer lookups (not in Issue type)
                        
                        return (
                          <TableRow key={issue.id}>
                            <TableCell className="font-mono text-xs">{issue.id}</TableCell>
                            <TableCell>{issue.createdBy}</TableCell>
                            <TableCell>{issue.roomNumber}</TableCell>
                            {/* <TableCell>{category}</TableCell> */}
                            <TableCell className="max-w-xs truncate">{issue.title}</TableCell>
                            <TableCell>
                              <Select
                                value={issue.status}
                                onValueChange={(value) => handleStatusChange(issue.id, value as Issue['status'])}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            {/* Removed repairer assignment column */}
                            <TableCell>{issue.upvotes}</TableCell>
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

        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-foreground">Manage Notices</h2>
              <Button onClick={handleNewNotice}>
                <Plus className="h-4 w-4 mr-2" />
                Create Notice
              </Button>
            </div>
            <div className="grid gap-4">
              {notices.map((notice) => (
                <Card key={notice.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{notice.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Posted: {new Date(notice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditNotice(notice)}>
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
                    <p className="text-sm text-foreground whitespace-pre-wrap">{notice.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <IssueModal issue={selectedIssue} open={viewModalOpen} onOpenChange={setViewModalOpen} />
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
            <AlertDialogAction onClick={confirmDeleteNotice}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
