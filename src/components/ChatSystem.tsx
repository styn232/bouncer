import React, { useState } from 'react';
import { MessageSquare, Send, Image, ShieldCheck, Search, Phone, Video, MoreVertical, Sparkles } from 'lucide-react';
import { Conversation, DirectMessage, SingleProfile, User } from '../types';

interface ChatSystemProps {
  conversations?: Conversation[];
  activeConversationId?: string | null;
  messages?: DirectMessage[];
  currentUser?: User | null;
  onSelectConversation?: (convId: string) => void;
  onSendMessage?: (convId: string, text: string, mediaUrl?: string) => void;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({
  conversations = [],
  activeConversationId,
  messages = [],
  currentUser,
  onSelectConversation,
  onSendMessage
}) => {
  const safeConversations = conversations || [];
  const safeMessages = messages || [];
  const [textInput, setTextInput] = useState('');
  const [mediaInput, setMediaInput] = useState('');
  const [showMediaBox, setShowMediaBox] = useState(false);

  const selectedConv = safeConversations.find(c => c.id === activeConversationId) || safeConversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || (!textInput.trim() && !mediaInput.trim())) return;
    if (onSendMessage) onSendMessage(selectedConv.id, textInput, mediaInput.trim() || undefined);
    setTextInput('');
    setMediaInput('');
    setShowMediaBox(false);
  };

  const icebreakers = [
    'Hey there! What’s your favorite place for coffee in town?',
    'Loved reading your profile bio! How was your weekend?',
    'Hi! What kind of music or movies do you enjoy?'
  ];

  return (
    <div className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-3 h-[680px]">
      {/* Sidebar - Conversations List */}
      <div className="border-r border-slate-800 flex flex-col h-full bg-slate-950/60">
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white font-serif flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Messages</span>
            </h2>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Live Chat
            </span>
          </div>
        </div>

        {/* Conversations Scroll */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {safeConversations.map(conv => {
            const isSelected = selectedConv?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation && onSelectConversation(conv.id)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-slate-800/90 border-l-4 border-rose-500' : 'hover:bg-slate-900/80'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={conv.participant.photos[0]}
                    alt={conv.participant.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-rose-500/40"
                  />
                  {conv.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-white truncate flex items-center gap-1">
                      <span>{conv.participant.name}</span>
                      {conv.participant.bouncerStatus === 'verified' && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </h3>
                    <span className="text-[10px] text-slate-500">{conv.lastMessageTime}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Thread Stage */}
      {selectedConv ? (
        <div className="md:col-span-2 flex flex-col h-full bg-slate-950">
          {/* Thread Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedConv.participant.photos[0]}
                alt={selectedConv.participant.name}
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-rose-500"
              />
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1">
                  <span>{selectedConv.participant.name}, {selectedConv.participant.age}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-[10px] text-slate-400">📍 {selectedConv.participant.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {safeMessages.map(msg => {
              const isMe = msg.senderId === currentUser?.id || msg.senderId === 'usr_demo';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <img src={msg.senderAvatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover shrink-0" />
                  )}

                  <div className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                    isMe
                      ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                  }`}>
                    {msg.text && <p>{msg.text}</p>}
                    {msg.mediaUrl && (
                      <img src={msg.mediaUrl} alt="Attachment" className="rounded-xl mt-1 max-h-48 object-cover" />
                    )}
                    <div className={`text-[9px] text-right opacity-70 ${isMe ? 'text-white' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Icebreaker Suggestions */}
          <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3" /> Icebreakers:
            </span>
            {icebreakers.map((ib, i) => (
              <button
                key={i}
                onClick={() => setTextInput(ib)}
                className="shrink-0 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700"
              >
                "{ib}"
              </button>
            ))}
          </div>

          {/* Media input toggle */}
          {showMediaBox && (
            <div className="px-4 py-2 bg-slate-900 border-t border-slate-800">
              <input
                type="url"
                placeholder="Paste image URL attachment..."
                value={mediaInput}
                onChange={e => setMediaInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
          )}

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMediaBox(!showMediaBox)}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <Image className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="Type your message..."
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />

            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-500 text-white rounded-xl shadow-md hover:scale-105 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="md:col-span-2 flex items-center justify-center p-8 text-slate-500 text-xs">
          Select a conversation to start chatting.
        </div>
      )}
    </div>
  );
};
