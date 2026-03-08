"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Eye, 
  Pin, 
  Lock, 
  Clock,
  Plus
} from "lucide-react";
import { Link, useParams } from "react-router";
import { formatDistanceToNow } from "date-fns";

interface Discussion {
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
  class?: {
    id: number;
    name: string;
  } | null;
}

interface DiscussionsListProps {
  classId?: string;
  filterType?: string;
  sortBy?: string;
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

// Main component that handles both global and class-specific discussions
export function DiscussionsList({ classId, filterType = 'all', sortBy = 'lastActivityAt' }: DiscussionsListProps) {
  const params = useParams();
  const resolvedClassId = classId || params.id;

  const { data: discussionsData, isLoading } = useQuery({
    queryKey: ['discussions', resolvedClassId, filterType, sortBy],
    queryFn: async () => {
      const endpoint = resolvedClassId
        ? `/classes/${resolvedClassId}/discussions?type=${filterType}&sortBy=${sortBy}&limit=50`
        : `/discussions?type=${filterType}&sortBy=${sortBy}&limit=50`;
      const response = await apiClient.get(endpoint);
      // Backend returns { data: discussions[], pagination: {...} }
      // Extract the discussions array from the response
      return response.data || [];
    },
  });

  const discussions = Array.isArray(discussionsData) ? discussionsData : [];

  const sortedDiscussions = [...discussions].sort((a: Discussion, b: Discussion) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastActivityAt || b.createdAt).getTime() - new Date(a.lastActivityAt || a.createdAt).getTime();
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (discussions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">No discussions yet</h3>
          <p className="text-muted-foreground mb-4">Start the conversation by creating the first discussion!</p>
          <Button asChild>
            <Link to={resolvedClassId ? `/classes/${resolvedClassId}/discussions/new` : '/discussions/new'}>
              <Plus className="h-4 w-4 mr-2" />
              Create Discussion
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedDiscussions.map((discussion: Discussion) => (
        <Card 
          key={discussion.id}
          className={`group hover:shadow-md transition-shadow ${discussion.isPinned ? 'border-primary/50 bg-primary/5 dark:bg-primary/10' : ''}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Vote Count */}
              <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                <div className="text-xs font-semibold text-muted-foreground">
                  {discussion.replyCount}
                </div>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {discussion.isPinned && (
                    <Pin className="h-3.5 w-3.5 text-primary fill-primary" />
                  )}
                  {discussion.isLocked && (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <Badge variant="secondary" className={`text-[10px] ${typeColors[discussion.type]}`}>
                    {typeLabels[discussion.type]}
                  </Badge>
                  {discussion.replyCount > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {discussion.replyCount} {discussion.replyCount === 1 ? 'reply' : 'replies'}
                    </Badge>
                  )}
                  {/* Show class name in global view */}
                  {!resolvedClassId && discussion.class && (
                    <Badge variant="outline" className="text-[10px]">
                      {discussion.class.name}
                    </Badge>
                  )}
                </div>

                <Link 
                  to={resolvedClassId 
                    ? `/classes/${resolvedClassId}/discussions/${discussion.id}`
                    : `/discussions/${discussion.id}`
                  }
                  className="group-hover:text-primary transition-colors"
                >
                  <h3 className="text-base font-semibold leading-tight mb-1 line-clamp-2">
                    {discussion.title}
                  </h3>
                </Link>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {discussion.content.replace(/[#*_`~]/g, '').substring(0, 150)}
                  {discussion.content.length > 150 ? '...' : ''}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={discussion.author?.image || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {discussion.author?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{discussion.author?.name || 'Unknown'}</span>
                    {discussion.author?.role === 'teacher' && (
                      <Badge variant="secondary" className="text-[9px] h-4 px-1">Teacher</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{discussion.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(discussion.lastActivityAt || discussion.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Export separate components for global and class-specific views
export function AllDiscussionsList({ filterType, sortBy }: { filterType: string; sortBy: string }) {
  return <DiscussionsList filterType={filterType} sortBy={sortBy} />;
}

export function ClassDiscussionsList({ classId, filterType, sortBy }: { classId: string; filterType: string; sortBy: string }) {
  return <DiscussionsList classId={classId} filterType={filterType} sortBy={sortBy} />;
}
