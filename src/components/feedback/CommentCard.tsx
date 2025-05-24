
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp, ChevronDown, User, Reply } from "lucide-react";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: "builder" | "feedback_provider";
  };
  content: string;
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
  createdAt: string;
  replies?: Comment[];
}

interface CommentCardProps {
  comment: Comment;
  onReply?: (commentId: string, content: string) => void;
  onVote?: (commentId: string, vote: "up" | "down") => void;
  isReply?: boolean;
}

export function CommentCard({ comment, onReply, onVote, isReply = false }: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [userVote, setUserVote] = useState(comment.userVote);
  const [votes, setVotes] = useState({
    up: comment.upvotes,
    down: comment.downvotes,
  });

  const handleVote = (voteType: "up" | "down") => {
    let newVotes = { ...votes };
    let newUserVote = userVote;

    // Remove previous vote if exists
    if (userVote === "up") newVotes.up--;
    if (userVote === "down") newVotes.down--;

    // Add new vote if different from current
    if (userVote !== voteType) {
      newVotes[voteType]++;
      newUserVote = voteType;
    } else {
      newUserVote = null;
    }

    setVotes(newVotes);
    setUserVote(newUserVote);
    onVote?.(comment.id, voteType);
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply?.(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn("space-y-3", isReply && "ml-8 border-l-2 border-gray-100 pl-4")}>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              {comment.author.avatar ? (
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-gray-600" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{comment.author.name}</span>
                {comment.author.role === "builder" && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Builder
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Comment Content */}
        <p className="text-gray-700 mb-3 leading-relaxed">{comment.content}</p>

        {/* Comment Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Vote Buttons */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("up")}
                className={cn(
                  "p-1 h-auto",
                  userVote === "up"
                    ? "text-green-600 bg-green-50 hover:bg-green-100"
                    : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                )}
              >
                <ChevronUp className={cn("h-4 w-4", userVote === "up" && "fill-current")} />
              </Button>
              <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
                {votes.up - votes.down}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("down")}
                className={cn(
                  "p-1 h-auto",
                  userVote === "down"
                    ? "text-red-600 bg-red-50 hover:bg-red-100"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                )}
              >
                <ChevronDown className={cn("h-4 w-4", userVote === "down" && "fill-current")} />
              </Button>
            </div>

            {/* Reply Button */}
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-gray-500 hover:text-blue-600 p-1 h-auto"
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4 space-y-3">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {replyContent.length}/500 characters
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onVote={onVote}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
