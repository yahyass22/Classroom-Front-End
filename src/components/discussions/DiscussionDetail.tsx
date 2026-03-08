"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Eye,
  Pin,
  Lock,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  Reply,
  Edit2,
  Trash2,
  CornerDownRight,
  Shield,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface DiscussionDetail {
  id: number;
  classId: number;
  authorId: string;
  title: string;
  content: string;
  type: 'general' | 'question' | 'announcement' | 'resource';
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    role: string;
    image: string | null;
  } | null;
  replies: DiscussionReply[];
}

interface DiscussionReply {
  id: number;
  discussionId: number;
  parentId: number | null;
  authorId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    role: string;
    image: string | null;
  } | null;
  voteCount: number;
  userVote: 'up' | 'down' | null;
}

const typeColors: Record<string, string> = {
  general: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  question: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  announcement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  resource: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const typeLabels: Record<string, string> = {
  general: 'General',
  question: 'Question',
  announcement: 'Announcement',
  resource: 'Resource',
};

interface DiscussionDetailProps {
  discussionId: string;
  classId?: string;
}

export function DiscussionDetail({ discussionId, classId }: DiscussionDetailProps) {
  const params = useParams();
  const resolvedClassId = classId || params.id as string;
  const navigate = useNavigate();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState<number | null>(null);

  const { data: discussion, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['discussion', discussionId, resolvedClassId],
    queryFn: async () => {
      const endpoint = resolvedClassId
        ? `/classes/${resolvedClassId}/discussions/${discussionId}`
        : `/discussions/${discussionId}`;
      const response = await apiClient.get<{ data: DiscussionDetail }>(endpoint);
      return response.data;
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: number }) => {
      await apiClient.post(`/discussions/${discussionId}/replies`, {
        content,
        parentId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply posted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post reply');
    },
  });

  const updateReplyMutation = useMutation({
    mutationFn: async ({ replyId, content }: { replyId: number; content: string }) => {
      await apiClient.put(`/discussions/${discussionId}/replies/${replyId}`, {
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
      setEditingId(null);
      toast.success('Reply updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update reply');
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ replyId, voteType }: { replyId: number; voteType: 'up' | 'down' | null }) => {
      await apiClient.post(`/discussions/${discussionId}/replies/${replyId}/vote`, {
        voteType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Action failed');
    },
  });

  const acceptAnswerMutation = useMutation({
    mutationFn: async (replyId: number) => {
      await apiClient.post(`/discussions/${discussionId}/replies/${replyId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
      toast.success('Answer marked as accepted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Action failed');
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: async (replyId: number) => {
      await apiClient.delete(`/discussions/${discussionId}/replies/${replyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
      setShowDeleteDialog(null);
      toast.success('Reply deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Action failed');
    },
  });

  const pinMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedClassId) throw new Error("Class ID is required to pin a discussion");
      await apiClient.post(`/classes/${resolvedClassId}/discussions/${discussionId}/pin`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
      toast.success('Discussion pinned');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to pin discussion');
    }
  });

  const lockMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedClassId) throw new Error("Class ID is required to lock a discussion");
      await apiClient.post(`/classes/${resolvedClassId}/discussions/${discussionId}/lock`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
      toast.success('Discussion locked');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to lock discussion');
    }
  });

  const handleReply = () => {
    if (!replyContent.trim()) return;
    createReplyMutation.mutate({ content: replyContent, parentId: replyingTo || undefined });
  };

  const handleVote = (replyId: number, currentVote: 'up' | 'down' | null, newVote: 'up' | 'down') => {
    voteMutation.mutate({ replyId, voteType: currentVote === newVote ? null : newVote });
  };

  const isTeacher = session?.user?.role === 'teacher' || session?.user?.role === 'admin';
  const isGlobalDiscussion = !resolvedClassId || params.id === undefined && !classId;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between w-full">
          <span>{error instanceof Error ? error.message : 'An error occurred while fetching the discussion'}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!discussion) {
    return (
      <Alert>
        <AlertDescription>Discussion not found</AlertDescription>
      </Alert>
    );
  }

  const rootReplies = discussion.replies?.filter((r: DiscussionReply) => !r.parentId) || [];
  const getRepliesToReply = (parentId: number) => 
    discussion.replies?.filter((r: DiscussionReply) => r.parentId === parentId) || [];

  return (
    <div className="space-y-6">
      {/* Main Discussion */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {discussion.isPinned && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {discussion.isLocked && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                )}
                <Badge variant="secondary" className={typeColors[discussion.type]}>
                  {typeLabels[discussion.type]}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold mb-2">{discussion.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={discussion.author?.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {discussion.author?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{discussion.author?.name || 'Unknown'}</span>
                  {discussion.author?.role === 'teacher' && (
                    <Badge variant="secondary" className="text-[9px] h-4 px-1">Teacher</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{discussion.viewCount} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            {isTeacher && !isGlobalDiscussion && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pinMutation.mutate()}
                  className={discussion.isPinned ? 'bg-primary/10' : ''}
                  disabled={pinMutation.isPending}
                  aria-label={discussion.isPinned ? "Unpin discussion" : "Pin discussion"}
                  title={discussion.isPinned ? "Unpin discussion" : "Pin discussion"}
                >
                  <Pin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => lockMutation.mutate()}
                  className={discussion.isLocked ? 'bg-amber-100' : ''}
                  disabled={lockMutation.isPending}
                  aria-label={discussion.isLocked ? "Unlock discussion" : "Lock discussion"}
                  title={discussion.isLocked ? "Unlock discussion" : "Lock discussion"}
                >
                  <Lock className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {discussion.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {discussion.replyCount} {discussion.replyCount === 1 ? 'Reply' : 'Replies'}
          </h2>
        </div>

        {rootReplies.map((reply: DiscussionReply) => (
          <div key={reply.id} className="space-y-4">
            <Card className={reply.isAccepted ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/10' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Vote Buttons */}
                  <div className="flex flex-col items-center gap-1 min-w-[2.5rem]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0",
                        reply.userVote === 'up' && "text-primary bg-primary/10"
                      )}
                      onClick={() => handleVote(reply.id, reply.userVote, 'up')}
                      aria-label={reply.userVote === 'up' ? "Remove upvote" : "Upvote reply"}
                      title={reply.userVote === 'up' ? "Remove upvote" : "Upvote reply"}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <span className={cn(
                      "text-sm font-semibold",
                      reply.userVote === 'up' && "text-primary",
                      reply.userVote === 'down' && "text-destructive"
                    )}>
                      {reply.voteCount}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0",
                        reply.userVote === 'down' && "text-destructive bg-destructive/10"
                      )}
                      onClick={() => handleVote(reply.id, reply.userVote, 'down')}
                      aria-label={reply.userVote === 'down' ? "Remove downvote" : "Downvote reply"}
                      title={reply.userVote === 'down' ? "Remove downvote" : "Downvote reply"}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={reply.author?.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {reply.author?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{reply.author?.name || 'Unknown'}</span>
                        {reply.author?.role === 'teacher' && (
                          <Badge variant="secondary" className="text-[9px] h-4 px-1">Teacher</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {reply.isAccepted && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Accepted
                          </Badge>
                        )}
                        {isTeacher && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => acceptAnswerMutation.mutate(reply.id)}
                            className="h-7 text-xs"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            {reply.isAccepted ? 'Unmark' : 'Accept'}
                          </Button>
                        )}
                        {reply.authorId === session?.user?.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingId(reply.id);
                                setEditContent(reply.content);
                              }}
                              className="h-7 text-xs"
                              aria-label="Edit reply"
                              title="Edit reply"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDeleteDialog(reply.id)}
                              className="h-7 text-xs text-destructive"
                              aria-label="Delete reply"
                              title="Delete reply"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {!discussion.isLocked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(reply.id)}
                            className="h-7 text-xs"
                          >
                            <Reply className="h-3.5 w-3.5 mr-1" />
                            Reply
                          </Button>
                        )}
                      </div>
                    </div>

                    {editingId === reply.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            disabled={updateReplyMutation.isPending}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => updateReplyMutation.mutate({ replyId: reply.id, content: editContent })}
                            disabled={updateReplyMutation.isPending || !editContent.trim()}
                          >
                            {updateReplyMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {reply.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Nested replies */}
                    {getRepliesToReply(reply.id).map((nestedReply: DiscussionReply) => (
                      <div key={nestedReply.id} className="mt-4 ml-6 pl-4 border-l-2 border-muted">
                        <div className="flex items-center gap-2 mb-2">
                          <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={nestedReply.author?.image || undefined} />
                            <AvatarFallback className="text-xs">
                              {nestedReply.author?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{nestedReply.author?.name || 'Unknown'}</span>
                          {nestedReply.author?.role === 'teacher' && (
                            <Badge variant="secondary" className="text-[9px] h-4 px-1">Teacher</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(nestedReply.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {nestedReply.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {rootReplies.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">No replies yet</h3>
              <p className="text-muted-foreground">Be the first to reply!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reply Form */}
      {!discussion.isLocked && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Your Reply</h3>
          </CardHeader>
          <CardContent>
            {replyingTo && (
              <Alert className="mb-4">
                <AlertDescription className="text-sm">
                  Replying to a comment. <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setReplyingTo(null)}>Cancel</Button>
                </AlertDescription>
              </Alert>
            )}
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply... (Markdown supported)"
              className="min-h-[120px] mb-4"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleReply} 
                disabled={!replyContent.trim() || createReplyMutation.isPending}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Post Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {discussion.isLocked && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            This discussion is locked. No new replies can be added.
          </AlertDescription>
        </Alert>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog !== null} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reply</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reply? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteDialog && deleteReplyMutation.mutate(showDeleteDialog)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
