import React, { useState } from 'react';
import { Plus, X, Eye } from 'lucide-react';
import { StoryItem, User } from '../types';

interface StoriesBarProps {
  stories?: StoryItem[];
  currentUser?: User | null;
  onCreateStory?: (mediaUrl: string, caption: string) => void;
  onAddStory?: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories = [],
  currentUser,
  onCreateStory,
  onAddStory
}) => {
  const safeStories = stories || [];
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrlInput) return;
    if (onCreateStory) onCreateStory(mediaUrlInput, captionInput);
    setMediaUrlInput('');
    setCaptionInput('');
    setShowUploadModal(false);
  };

  const handlePlusClick = () => {
    if (onAddStory) onAddStory();
    else setShowUploadModal(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {/* Add Story Button */}
        <div
          onClick={handlePlusClick}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
        >
          <div className="relative w-16 h-16 rounded-full bg-slate-900 border-2 border-dashed border-rose-500/60 flex items-center justify-center group-hover:scale-105 transition-transform">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Me" className="w-full h-full rounded-full object-cover opacity-60" />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center">
              <Plus className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-300">Your Story</span>
        </div>

        {/* Stories List */}
        {safeStories.map(story => (
          <div
            key={story.id}
            onClick={() => setActiveStory(story)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-rose-600 group-hover:scale-105 transition-transform shadow-md">
              <img
                src={story.mediaUrl}
                alt={story.authorName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full border-2 border-slate-950"
              />
            </div>
            <span className="text-[10px] font-bold text-slate-200 truncate max-w-[64px]">
              {story.authorName.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full h-[580px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
            <img
              src={activeStory.mediaUrl}
              alt="Story"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90" />

            {/* Header */}
            <div className="relative z-10 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <img
                  src={activeStory.authorAvatar}
                  alt={activeStory.authorName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-rose-500"
                />
                <div>
                  <h4 className="text-xs font-bold">{activeStory.authorName}</h4>
                  <span className="text-[9px] text-slate-300">{activeStory.createdAt}</span>
                </div>
              </div>

              <button onClick={() => setActiveStory(null)} className="p-1 rounded-full bg-slate-900/60 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Caption & Footer */}
            <div className="relative z-10 p-5 space-y-2 text-white">
              {activeStory.caption && (
                <p className="text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  {activeStory.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Story Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Post 24h Story</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={mediaUrlInput}
                  onChange={e => setMediaUrlInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Caption</label>
                <input
                  type="text"
                  placeholder="Quick update for your followers..."
                  value={captionInput}
                  onChange={e => setCaptionInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold"
              >
                Post Story
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
