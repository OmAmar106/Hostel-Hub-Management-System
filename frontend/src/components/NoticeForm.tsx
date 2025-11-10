import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NoticeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addNotice: (data: { title: string, content: string, author: string }) => Promise<void>;
}

export const NoticeForm = ({ open, onOpenChange, addNotice }: NoticeFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    if (open) setFormData({ title: '', content: '' });
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addNotice({ ...formData, author: user?.name || 'Admin' });
      onOpenChange(false);
    } catch (error) {
      // Error toast is already handled in DataContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Create New Notice</DialogTitle></DialogHeader>
        <form id="notice-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} required />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="notice-form" disabled={loading}>{loading ? 'Saving...' : 'Create Notice'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};