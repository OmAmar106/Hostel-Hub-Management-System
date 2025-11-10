// src/components/IssueCard.tsx

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { UpvoteButton } from './UpvoteButton';
import { Eye, Edit, Trash2 } from 'lucide-react';
// Import the OFFICIAL Issue type from our DataContext
import { Issue } from '@/contexts/DataContext';

interface IssueCardProps {
  issue: Issue;
  onView: (issue: Issue) => void;
  onEdit?: (issue: Issue) => void;
  // The id from the database is a number, so we change the type here
  onDelete?: (id: number) => void; 
  showActions?: boolean;
}

export const IssueCard = ({ issue, onView, onEdit, onDelete, showActions = false }: IssueCardProps) => {
  // We'll add category back later when it's in the database model
  // const { categories } = useData();
  // const category = categories.find(c => c.id === issue.categoryId)?.name || 'Unknown';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">{issue.title}</h3>
             <p className="text-sm text-muted-foreground mt-1">
                 {/* Corrected property names */}
                 {issue.createdBy} • Room {issue.roomNumber}
             </p>
          </div>
          {/* StatusBadge uses a different status type, so we cast it for now. We will fix StatusBadge later if needed. */}
          <StatusBadge status={issue.status as any} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground line-clamp-2">{issue.description}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {/* Corrected property name from postedDate to createdAt */}
          Posted: {new Date(issue.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {/* Pass the id which is a number */}
        <UpvoteButton issueId={issue.id} upvotes={issue.upvotes} voters={issue.voters} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onView(issue)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {showActions && (
            <>
              {onEdit && issue.status !== 'Resolved' && ( // 'Resolved' is our new status
                <Button variant="outline" size="sm" onClick={() => onEdit(issue)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onDelete && (
                // Pass the numeric id to the onDelete function
                <Button variant="destructive" size="sm" onClick={() => onDelete(issue.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};