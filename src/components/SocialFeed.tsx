import React, { useState } from 'react';
import { Heart, MessageSquare, Send, ShieldCheck, Plus, AlertTriangle } from 'lucide-react';
import { FeedPost, User } from '../types';

interface SocialFeedProps {
  posts?: FeedPost[];
  currentUser?: User | null;
  onLikePost?: (postId: string) => void;
  onCommentPost?: (postId: string, text: string) => void;
  onCreatePost?: (content: string, mediaUrl?: string) => void;
  onReportPost?: (postId: string, authorName: string) => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  posts = [],
  currentUser,
  onLikePost,
  onCommentPost,
  onCreatePost,
  onReportPost
}) => {
  const safePosts = posts || [];
  const [newContent, setNewContent] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    if (onCreatePost) onCreatePost(newContent, newMediaUrl.trim() || undefined);
    setNewContent('');
    setNewMediaUrl('');
  };

  const handleSendComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    if (onCommentPost) onCommentPost(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt="User"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500"
          />
          <h3 className="text-xs font-bold text-white">Share a Thought or Date Experience</h3>
        </div>

        <form onSubmit={handleSubmitPost} className="space-y-3">
          <textarea
            rows={2}
            placeholder="What's on your mind today?"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />

          {newMediaUrl && (
            <div className="relative rounded-xl overflow-hidden max-h-48 border border-slate-800">
              <img src={newMediaUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <input
              type="url"
              placeholder="Photo URL (optional)..."
              value={newMediaUrl}
              onChange={e => setNewMediaUrl(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white w-2/3"
            />

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all"
            >
              Post to Feed
            </button>
          </div>
        </form>
      </div>

      {/* Feed Posts List */}
      <div className="space-y-4">
        {safePosts.map(post => {
          const isLiked = post.likedByMe;
          const isCommentOpen = openCommentPostId === post.id;

          return (
            <div
              key={post.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl"
            >
              {/* Author Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-2xl object-cover ring-2 ring-rose-500"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      <span>{post.authorName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </h4>
                    <span className="text-[10px] text-slate-500">{post.createdAt}</span>
                  </div>
                </div>

                {onReportPost && (
                  <button
                    onClick={() => onReportPost(post.id, post.authorName)}
                    className="p-2 text-slate-500 hover:text-rose-400"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Content & Media */}
              <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>

              {post.mediaUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-96">
                  <img src={post.mediaUrl} alt="Post Attachment" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Like / Comment Action Bar */}
              <div className="flex items-center gap-6 pt-2 border-t border-slate-800/80 text-xs">
                <button
                  onClick={() => onLikePost && onLikePost(post.id)}
                  className={`flex items-center gap-1.5 font-bold ${
                    isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{post.likesCount || 0} Likes</span>
                </button>

                <button
                  onClick={() => setOpenCommentPostId(isCommentOpen ? null : post.id)}
                  className="flex items-center gap-1.5 font-bold text-slate-400 hover:text-white"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{(post.comments || []).length} Comments</span>
                </button>
              </div>

              {/* Comments Section */}
              {isCommentOpen && (
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(post.comments || []).map(comment => (
                      <div key={comment.id} className="flex gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <img src={comment.authorAvatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover shrink-0" />
                        <div>
                          <div className="font-bold text-white text-[11px]">{comment.authorName}</div>
                          <p className="text-slate-300 text-[11px]">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      onClick={() => handleSendComment(post.id)}
                      className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
