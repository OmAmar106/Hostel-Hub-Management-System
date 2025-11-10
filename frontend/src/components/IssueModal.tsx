import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from './StatusBadge';
import { Issue } from '@/contexts/DataContext';
import { useData } from '@/contexts/DataContext';

interface IssueModalProps {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IssueModal = ({ issue, open, onOpenChange }: IssueModalProps) => {
  const { categories } = useData();
  
  if (!issue) return null;

  // Category is not linked in Issue type currently
  const category = undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{issue.title}</DialogTitle>
          <DialogDescription>
            Issue ID: {issue.id} • Posted on {new Date(issue.createdAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Student</p>
              <p className="text-foreground">{issue.createdBy}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Room</p>
              <p className="text-foreground">{issue.roomNumber}</p>
            </div>
            {/* Category not available */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <StatusBadge status={issue.status} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upvotes</p>
              <p className="text-foreground">{issue.upvotes}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
            <p className="text-foreground whitespace-pre-wrap">{issue.description}</p>
          </div>
          {/* Attachments and resolvedAt not present in current Issue type */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
