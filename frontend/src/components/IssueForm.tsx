import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData, Issue as IssueType } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// The data structure our form will submit
interface IssueFormData {
  title: string;
  description: string;
  categoryId?: string;
}

// Props the component expects (note editIssue added as optional)
interface IssueFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addIssue: (data: any) => Promise<void>;
  issue?: any | null; // when provided -> edit mode
  editIssue?: (issueId: number, updates: Partial<IssueType>) => Promise<boolean>;
}

export const IssueForm = ({ open, onOpenChange, issue, addIssue, editIssue: editIssueProp }: IssueFormProps) => {
  // get categories and context editIssue as fallback
  const { categories, editIssue: editIssueFromCtx } = useData();
  const editIssue = editIssueProp ?? editIssueFromCtx;

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IssueFormData>({
    title: "",
    description: "",
    categoryId: undefined,
  });

  // Prefill when opening for edit; clear when opening for create
  useEffect(() => {
    if (!open) return;
    if (issue) {
      const categoryId =
        (issue as any).categoryId ??
        (issue as any).category_id ??
        (issue as any).category ??
        undefined;

      setFormData({
        title: issue.title || "",
        description: issue.description || "",
        categoryId: categoryId ? String(categoryId) : undefined,
      });
    } else {
      setFormData({ title: "", description: "", categoryId: undefined });
    }
  }, [open, issue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to submit an issue.");
      return;
    }
    setLoading(true);

    try {
      if (issue) {
        // Edit flow
        if (!editIssue) {
          throw new Error("editIssue not available");
        }
        const success = await editIssue(issue.id, {
          title: formData.title,
          description: formData.description,
          roomNumber: (issue as any).roomNumber ?? (issue as any).room_number ?? user.roomNo ?? "",
          categoryId: formData.categoryId,
        });
        if (!success) throw new Error("Update failed");
        toast.success("Issue updated");
        onOpenChange(false);
      } else {
        // Create flow
        const payload: any = {
          title: formData.title,
          description: formData.description,
          roomNumber: user?.roomNo ?? "N/A",
          createdBy: user?.name ?? user?.email ?? "Student",
        };
        if (formData.categoryId) {
          payload.category_id = formData.categoryId;
          payload.categoryId = formData.categoryId;
        }
        await addIssue(payload);
        toast.success("Issue submitted");
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("IssueForm submit error:", error);
      toast.error(error?.message || "Failed to submit issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{issue ? "Edit Issue" : "Raise New Issue"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="issue-form" className="space-y-4">
          {/* Category dropdown */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(v) => setFormData((s) => ({ ...s, categoryId: v }))}
              required={!issue} // require category on create; on edit allow leaving as-is
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Leaking Faucet in Washroom"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide details about the issue."
              rows={5}
              required
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="issue-form" disabled={loading}>
            {loading ? (issue ? "Updating..." : "Submitting...") : issue ? "Update Issue" : "Submit Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IssueForm;
