import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Wrench, LogOut, Eye } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssueModal } from "@/components/IssueModal";
import ThemeToggle from "@/components/ui/ThemeToggle"; // ✅ Added

const API_BASE = "http://localhost:5000";

interface Issue {
  id: number;
  title: string;
  description: string;
  roomNumber: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdBy: string;
  createdAt: string;
  upvotes: number;
  voters: string[];
  assignedTo?: number;
}

const RepairerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | Issue["status"]>("all");

  // 🔹 Fetch assigned issues
  useEffect(() => {
    const fetchMyIssues = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/my-issues`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch issues");
        const data = await res.json();
        setIssues(data);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error loading issues",
          description: "Could not fetch assigned issues.",
          variant: "destructive",
        });
      }
    };
    fetchMyIssues();
  }, []);

  // 🔹 Filter by status
  const filteredIssues =
    statusFilter === "all"
      ? issues
      : issues.filter((issue) => issue.status === statusFilter);

  // 🔹 Handle status update
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

      if (!res.ok) throw new Error("Failed to update status");

      setIssues((prev) =>
        prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
      );

      toast({
        title: "Status updated",
        description: `Issue marked as ${newStatus}`,
      });
    } catch {
      toast({
        title: "Error updating status",
        variant: "destructive",
      });
    }
  };

  // 🔹 View issue details
  const handleView = (issue: Issue) => {
    setSelectedIssue(issue);
    setViewModalOpen(true);
  };

  // 🔹 Logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Repairer Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {user?.name} (Repairer)
            </span>

            {/* ✅ Dark/Light Mode Toggle */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Assigned Issues
            </h2>
          </div>

          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
          >
            <TabsList className="bg-gray-100 dark:bg-gray-800 rounded-md">
              <TabsTrigger value="all">All ({issues.length})</TabsTrigger>
              <TabsTrigger value="Pending">
                Pending ({issues.filter((i) => i.status === "Pending").length})
              </TabsTrigger>
              <TabsTrigger value="In Progress">
                In Progress ({issues.filter((i) => i.status === "In Progress").length})
              </TabsTrigger>
              <TabsTrigger value="Resolved">
                Resolved ({issues.filter((i) => i.status === "Resolved").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-6">
              <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    {filteredIssues.length === 0 ? (
                      <div className="py-12 text-center text-gray-600 dark:text-gray-400">
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
                            <TableHead>Posted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredIssues.map((issue) => (
                            <TableRow key={issue.id}>
                              <TableCell>{issue.id}</TableCell>
                              <TableCell>{issue.title}</TableCell>
                              <TableCell>{issue.createdBy}</TableCell>
                              <TableCell>{issue.roomNumber}</TableCell>
                              <TableCell>
                                {new Date(issue.createdAt).toLocaleDateString()}
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
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
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
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Issue Modal */}
      <IssueModal
        issue={selectedIssue}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />
    </div>
  );
};

export default RepairerDashboard;
