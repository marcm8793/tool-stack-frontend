import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDocs,
  Timestamp,
  QueryDocumentSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  tool_id: string;
  parent_comment_id: string | null;
  created_at: Timestamp;
  user: {
    displayName: string;
    photoURL: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  toolId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ toolId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContents, setReplyContents] = useState<Record<string, string>>(
    {}
  );
  const replyInputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const fetchUserData = async (userId: string) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        displayName: userData.displayName || "Anonymous",
        photoURL: userData.photoURL || "",
      };
    } else {
      return {
        displayName: "Anonymous",
        photoURL: "",
      };
    }
  };

  const fetchCommentWithReplies = useCallback(
    async (docSnapshot: QueryDocumentSnapshot): Promise<Comment> => {
      const commentData = docSnapshot.data() as Comment;
      commentData.id = docSnapshot.id;

      // Fetch user data from Firestore
      const userData = await fetchUserData(commentData.user_id);
      commentData.user = userData;

      // Fetch replies recursively
      const repliesQ = query(
        collection(db, "comments"),
        where("parent_comment_id", "==", docSnapshot.id),
        orderBy("created_at", "asc")
      );
      const repliesSnapshot = await getDocs(repliesQ);
      commentData.replies = await Promise.all(
        repliesSnapshot.docs.map(fetchCommentWithReplies)
      );

      return commentData;
    },
    []
  );

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const q = query(
          collection(db, "comments"),
          where("tool_id", "==", toolId),
          where("parent_comment_id", "==", null),
          orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);
        const commentsData: Comment[] = [];

        for (const docSnapshot of querySnapshot.docs) {
          const commentData = await fetchCommentWithReplies(docSnapshot);
          commentsData.push(commentData);
        }

        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [fetchCommentWithReplies, toolId]);

  const handleSubmitComment = useCallback(
    async (parentCommentId: string | null = null) => {
      if (!user) return;

      const content = parentCommentId
        ? replyContents[parentCommentId]
        : newComment;
      if (!content?.trim()) return;

      const commentData = {
        content,
        user_id: user.uid,
        tool_id: toolId,
        parent_comment_id: parentCommentId,
        created_at: Timestamp.now(),
      };

      try {
        const docRef = await addDoc(collection(db, "comments"), commentData);
        const newCommentWithUser = {
          ...commentData,
          id: docRef.id,
          user: {
            displayName: user.displayName || "Anonymous",
            photoURL: user.photoURL || "",
          },
          replies: [],
        };

        setComments((prevComments) => {
          const updateReplies = (comments: Comment[]): Comment[] => {
            return comments.map((comment) => {
              if (comment.id === parentCommentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newCommentWithUser],
                };
              } else if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: updateReplies(comment.replies),
                };
              }
              return comment;
            });
          };

          if (parentCommentId) {
            return updateReplies(prevComments);
          } else {
            return [newCommentWithUser, ...prevComments];
          }
        });

        // Clear the input after submitting
        if (parentCommentId) {
          setReplyContents((prev) => ({ ...prev, [parentCommentId]: "" }));
        } else {
          setNewComment("");
        }
        setReplyingTo(null);
      } catch (error) {
        console.error("Error submitting comment:", error);
      }
    },
    [user, toolId, newComment, replyContents]
  );

  const handleReplyChange = useCallback((commentId: string, value: string) => {
    setReplyContents((prev) => ({ ...prev, [commentId]: value }));
  }, []);

  const CommentItem: React.FC<{ comment: Comment; depth?: number }> =
    React.memo(({ comment, depth = 0 }) => {
      const replyInputRef = useRef<HTMLTextAreaElement>(null);

      useEffect(() => {
        replyInputRefs.current[comment.id] = replyInputRef.current;
        if (replyingTo === comment.id && replyInputRef.current) {
          replyInputRef.current.focus();
        }
      }, [comment.id]);

      const handleTextareaChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
      ) => {
        const { value } = e.target;
        const textarea = e.target;
        const caret = textarea.selectionStart;

        handleReplyChange(comment.id, value);

        setTimeout(() => {
          if (replyInputRefs.current[comment.id]) {
            replyInputRefs.current[comment.id]?.setSelectionRange(caret, caret);
          }
        }, 0);
      };

      return (
        <div className={`space-y-2 mb-4 ${depth > 0 ? "ml-6" : ""} relative`}>
          <div
            className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 ${
              depth > 0 ? "-ml-3" : ""
            }`}
          />
          <div className="flex items-start space-x-3 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.user.photoURL} />
              <AvatarFallback>{comment.user.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm dark:text-gray-200">
                  {comment.user.displayName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {comment.created_at.toDate().toLocaleString()}
                </span>
              </div>
              <p className="text-sm mt-1 dark:text-gray-300">
                {comment.content}
              </p>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Reply
                </Button>
              )}
              {replyingTo === comment.id && (
                <div className="mt-3">
                  <Textarea
                    ref={replyInputRef}
                    id={`reply-${comment.id}`}
                    name={`reply-${comment.id}`}
                    value={replyContents[comment.id] || ""}
                    onChange={handleTextareaChange}
                    placeholder="Write a reply..."
                    className="mb-2 text-sm dark:bg-gray-700 dark:text-gray-200"
                    rows={3}
                  />
                  <Button
                    onClick={() => handleSubmitComment(comment.id)}
                    size="sm"
                    className="text-xs"
                  >
                    Post Reply
                  </Button>
                </div>
              )}
            </div>
          </div>
          {comment.replies?.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      );
    });

  return (
    <div className="container w-6/12 mt-8">
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-200">Comments</h2>
      {user ? (
        <div className="mb-6">
          <Textarea
            id="new-comment"
            name="new-comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="mb-2 dark:bg-gray-700 dark:text-gray-200"
            rows={4}
          />
          <Button onClick={() => handleSubmitComment()}>Post Comment</Button>
        </div>
      ) : (
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Please sign in to leave a comment.
        </p>
      )}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};
