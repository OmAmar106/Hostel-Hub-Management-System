import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { IssueModal } from '@/components/IssueModal';
import { StatusBadge } from '@/components/StatusBadge';
import { Issue } from '@/services/mockData';
import { Wrench, LogOut, Eye } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RepairerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { issues, categories, updateIssue } = useData();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | Issue['status']>('all');

  // TODO: Backend should filter issues assigned to this repairer
  const myIssues = issues.filter(issue => issue.assignedRepairerId === user?.id);

  const filteredIssues = statusFilter === 'all' 
    ? myIssues 
    : myIssues.filter(issue => issue.status === statusFilter);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleView = (issue: Issue) => {
    setSelectedIssue(issue);
    setViewModalOpen(true);
  };

  const handleStatusChange = async (issueId: string, newStatus: Issue['status']) => {
    // TODO: Backend should verify repairer role and assignment before allowing status update
    // Repairer can only change status, not other fields
    const updates: Partial<Issue> = { status: newStatus };
    if (newStatus === 'Completed') {
      updates.resolvedAt = new Date().toISOString();
    }
    await updateIssue(issueId, updates);
    toast({
      title: 'Status updated',
      description: `Issue status changed to ${newStatus}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Repairer Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name} (Repairer)</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Assigned Issues</h2>
          </div>

          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <TabsList>
              <TabsTrigger value="all">All ({myIssues.length})</TabsTrigger>
              <TabsTrigger value="Pending">
                Pending ({myIssues.filter(i => i.status === 'Pending').length})
              </TabsTrigger>
              <TabsTrigger value="In Progress">
                In Progress ({myIssues.filter(i => i.status === 'In Progress').length})
              </TabsTrigger>
              <TabsTrigger value="Completed">
                Completed ({myIssues.filter(i => i.status === 'Completed').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    {filteredIssues.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        No issues assigned to you
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Posted Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredIssues.map((issue) => {
                            const category = categories.find(c => c.id === issue.categoryId)?.name;
                            
                            return (
                              <TableRow key={issue.id}>
                                <TableCell className="font-mono text-xs">{issue.id}</TableCell>
                                <TableCell className="max-w-xs truncate font-medium">{issue.title}</TableCell>
                                <TableCell>{issue.studentName}</TableCell>
                                <TableCell>{issue.roomNo}</TableCell>
                                <TableCell>{category}</TableCell>
                                <TableCell>
                                  {new Date(issue.postedDate).toLocaleDateString()}
                                </TableCell>
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
                                      <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
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
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Modal */}
      <IssueModal issue={selectedIssue} open={viewModalOpen} onOpenChange={setViewModalOpen} />
    </div>
  );
};

export default RepairerDashboard;
