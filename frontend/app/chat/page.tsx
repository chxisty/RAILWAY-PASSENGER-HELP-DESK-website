'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Send, 
  User, 
  Trash2, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Plus, 
  MessageSquare, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Sparkles, 
  Train, 
  ShieldAlert, 
  FileText, 
  PhoneCall, 
  Clock, 
  ArrowRight,
  ExternalLink,
  Search,
  AlertCircle
} from 'lucide-react';
import { 
  streamChatMessage, 
  sendChatMessage, 
  fetchConversations, 
  fetchConversationDetails, 
  deleteConversation, 
  clearAllConversations, 
  regenerateChatMessage, 
  ConversationItem, 
  ConversationMessage, 
  ChatResponse, 
  RetrievedSource 
} from '@/lib/api';
import ChatMessageMarkdown from '@/components/ChatMessageMarkdown';
import { stripMarkdownForCopy } from '@/lib/textUtils';
import { useAuth } from '@/context/AuthContext';

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: RetrievedSource[];
  suggestedFollowups?: string[];
  intent?: string;
  isStreaming?: boolean;
  statusText?: string;
}

const STARTER_PROMPTS = [
  {
    icon: Train,
    title: 'Find Trains on Corridor',
    prompt: 'Find direct trains from Alappuzha to Ernakulam',
    tag: 'Timetable Route Graph'
  },
  {
    icon: FileText,
    title: 'Tatkal & Refund Policies',
    prompt: 'What are the Tatkal cancellation and refund rules?',
    tag: 'Gazette Circular Precedence'
  },
  {
    icon: Sparkles,
    title: 'Station Amenities & Lounges',
    prompt: 'What passenger facilities are available at New Delhi (NDLS)?',
    tag: 'Verified Station Amenities'
  },
  {
    icon: PhoneCall,
    title: 'Emergency & Medical Aid',
    prompt: 'How do I get medical help or contact RPF on a train?',
    tag: 'Rail Madad 139 & RPF 182'
  }
];

function ChatGPTAssistant() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string>('');
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load conversation list
  const refreshConversations = useCallback(async () => {
    try {
      const list = await fetchConversations(user?.id);
      setConversations(list || []);
    } catch (e) {
      console.warn('Failed to fetch conversation list:', e);
    }
  }, [user?.id]);

  // Initialize or resume conversation session
  useEffect(() => {
    refreshConversations();

    const urlConvId = searchParams.get('conv');
    const urlQuery = searchParams.get('q');

    if (urlConvId) {
      loadConversation(urlConvId);
    } else {
      const savedId = localStorage.getItem('rail_active_conv_id');
      const activeId = savedId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setCurrentConvId(activeId);
      localStorage.setItem('rail_active_conv_id', activeId);

      // If existing session has messages, load them
      if (savedId) {
        loadConversation(savedId);
      }
    }

    if (urlQuery && urlQuery.trim()) {
      handleSendMessage(urlQuery.trim());
    }
  }, []);

  // Auto-scroll when new content arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingStatus, isLoading]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputValue]);

  const loadConversation = async (convId: string) => {
    try {
      setIsLoading(true);
      setCurrentConvId(convId);
      localStorage.setItem('rail_active_conv_id', convId);

      const res = await fetchConversationDetails(convId);
      if (res && res.messages && res.messages.length > 0) {
        const loaded: UIMessage[] = res.messages.map((m: ConversationMessage) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: m.sources,
          suggestedFollowups: m.suggested_followups,
          intent: m.intent
        }));
        setMessages(loaded);
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.warn('Could not load conversation history:', e);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setCurrentConvId(newId);
    localStorage.setItem('rail_active_conv_id', newId);
    setMessages([]);
    setInputValue('');
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteConv = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (currentConvId === convId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all conversation history?')) {
      try {
        await clearAllConversations(user?.id);
        setConversations([]);
        handleNewChat();
      } catch (err) {
        console.error('Clear all failed:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const activeId = currentConvId || `conv_${Date.now()}`;
    if (!currentConvId) {
      setCurrentConvId(activeId);
      localStorage.setItem('rail_active_conv_id', activeId);
    }

    const userMsgId = `usr_${Date.now()}`;
    const assistantMsgId = `ast_${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message & optimistic assistant streaming message
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        content: query,
        timestamp: timeStr
      },
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: timeStr,
        isStreaming: true,
        statusText: 'Querying official railway database...'
      }
    ]);

    setIsLoading(true);
    setStreamingStatus('Searching railway timetable database & circulars...');

    let accumulatedContent = '';

    try {
      const response = await streamChatMessage(
        {
          message: query,
          conversation_id: activeId,
          history: messages.slice(-4).map(m => ({ role: m.role, content: m.content }))
        },
        // onChunk callback
        (chunk: string) => {
          accumulatedContent += chunk;
          setMessages(prev => prev.map(m => {
            if (m.id === assistantMsgId) {
              return {
                ...m,
                content: accumulatedContent,
                statusText: undefined
              };
            }
            return m;
          }));
        },
        // onStatus callback
        (status: string) => {
          setStreamingStatus(status);
          setMessages(prev => prev.map(m => {
            if (m.id === assistantMsgId) {
              return { ...m, statusText: status };
            }
            return m;
          }));
        }
      );

      // Finalize the message with response payload
      setMessages(prev => prev.map(m => {
        if (m.id === assistantMsgId) {
          return {
            ...m,
            content: response.answer || accumulatedContent,
            sources: response.sources || [],
            suggestedFollowups: response.suggested_followups || [],
            intent: response.intent,
            isStreaming: false,
            statusText: undefined
          };
        }
        return m;
      }));

      // Refresh sidebar list so new title appears
      refreshConversations();

    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev => prev.map(m => {
        if (m.id === assistantMsgId) {
          return {
            ...m,
            content: `⚠️ An error occurred while retrieving railway information: ${err.message || 'Server connection error'}. Please try again or dial Rail Madad at 139.`,
            isStreaming: false,
            statusText: undefined
          };
        }
        return m;
      }));
    } finally {
      setIsLoading(false);
      setStreamingStatus(null);
    }
  };

  const handleRegenerate = async () => {
    if (isLoading || !currentConvId) return;

    // Find the last assistant message
    const lastAstIdx = [...messages].reverse().findIndex(m => m.role === 'assistant');
    if (lastAstIdx === -1) return;
    const realIdx = messages.length - 1 - lastAstIdx;
    const targetMsg = messages[realIdx];

    setIsLoading(true);
    setStreamingStatus('Re-evaluating official railway database...');

    setMessages(prev => prev.map((m, idx) => {
      if (idx === realIdx) {
        return {
          ...m,
          content: '',
          isStreaming: true,
          statusText: 'Regenerating grounded answer...'
        };
      }
      return m;
    }));

    try {
      const response = await regenerateChatMessage({
        message: '',
        conversation_id: currentConvId
      });

      setMessages(prev => prev.map((m, idx) => {
        if (idx === realIdx) {
          return {
            ...m,
            content: response.answer,
            sources: response.sources,
            suggestedFollowups: response.suggested_followups,
            intent: response.intent,
            isStreaming: false,
            statusText: undefined
          };
        }
        return m;
      }));
    } catch (err: any) {
      console.error('Regenerate failed:', err);
      setMessages(prev => prev.map((m, idx) => {
        if (idx === realIdx) {
          return {
            ...m,
            content: targetMsg.content, // restore previous
            isStreaming: false,
            statusText: undefined
          };
        }
        return m;
      }));
    } finally {
      setIsLoading(false);
      setStreamingStatus(null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    const clean = stripMarkdownForCopy(text);
    navigator.clipboard.writeText(clean);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSources = (id: string) => {
    setExpandedSources(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-text-primary)] transition-colors duration-200">
      
      {/* =========================================================================
          LEFT SIDEBAR: CONVERSATION HISTORY & ACTIONS
          ========================================================================= */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-72 bg-[#FAF5ED] dark:bg-[#150F21] border-r border-[#E5D5C4] dark:border-[#382A4A] transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {/* Top Header & New Chat Button */}
        <div className="p-3 border-b border-[#E5D5C4] dark:border-[#382A4A] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-white dark:bg-[#20172E] border border-[#E5D5C4] dark:border-[#3E2D52]">
                <Image 
                  src="/logo.jpg" 
                  alt="RailAssist AI Logo" 
                  width={28} 
                  height={28} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#302638] dark:text-[#FAF5ED]">
                RailAssist Sessions
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-[#655967] dark:text-[#B8A8BE] hover:bg-[#EBDDCF] dark:hover:bg-[#281D3A]"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#E98245] to-[#D96B27] hover:from-[#EA8D53] hover:to-[#DE7634] text-white font-medium text-xs shadow-sm shadow-[#E98245]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>New Railway Enquiry</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#7E6E82] dark:text-[#9A89A2]">
            Recent Chats ({conversations.length})
          </div>

          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#7E6E82] dark:text-[#9A89A2]">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
              No saved conversations yet. Start a new enquiry!
            </div>
          ) : (
            conversations.map(conv => {
              const isActive = conv.id === currentConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    loadConversation(conv.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`group relative flex items-center justify-between gap-2 p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    isActive
                      ? 'bg-[#EBDDCF] dark:bg-[#2A1E3C] text-[#302638] dark:text-[#FAF5ED] font-semibold shadow-sm border border-[#E0D0BE] dark:border-[#43325B]'
                      : 'text-[#4F4254] dark:text-[#C5B7CC] hover:bg-[#F2E5D6] dark:hover:bg-[#201630]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#E98245]' : 'text-[#7E6E82] dark:text-[#9A89A2]'}`} />
                    <span className="truncate">{conv.title || 'Railway Enquiry'}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConv(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 hover:text-red-500 transition-opacity"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E5D5C4] dark:border-[#382A4A] bg-[#F4E9DC]/60 dark:bg-[#110B1C]/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#E98245]/20 text-[#E98245] flex items-center justify-center font-bold text-[11px]">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'P'}
            </div>
            <span className="truncate text-xs font-medium text-[#4F4254] dark:text-[#C5B7CC]">
              {user?.full_name || 'Passenger Guest'}
            </span>
          </div>

          {conversations.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 text-[#7E6E82] dark:text-[#9A89A2] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Clear all conversations"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </aside>

      {/* =========================================================================
          MAIN CHAT PANE
          ========================================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-bg)]">
        
        {/* Main Chat Header */}
        <header className="h-14 border-b border-[#E5D5C4] dark:border-[#382A4A] bg-[#FAF5ED]/80 dark:bg-[#150F21]/80 backdrop-blur-md px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-2 rounded-lg text-[#655967] dark:text-[#B8A8BE] hover:bg-[#EBDDCF] dark:hover:bg-[#281D3A] transition-colors"
              title={isSidebarOpen ? "Hide session history" : "Show session history"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-white dark:bg-[#20172E] border border-[#E5D5C4] dark:border-[#3E2D52]">
                <Image 
                  src="/logo.jpg" 
                  alt="RailAssist AI Logo" 
                  width={28} 
                  height={28} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xs sm:text-sm font-bold text-[#302638] dark:text-[#FAF5ED] leading-tight">
                    RailAssist AI Assistant
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    100% Grounded
                  </span>
                </div>
                <p className="text-[10px] text-[#7E6E82] dark:text-[#9A89A2] leading-tight">
                  Official SQLite Database (5,208 trains) • Gazette Circulars Precedence
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="hidden sm:flex items-center gap-1 text-xs py-1.5 px-2.5 rounded-lg border border-[#E5D5C4] dark:border-[#382A4A] text-[#4F4254] dark:text-[#C5B7CC] hover:bg-[#EBDDCF] dark:hover:bg-[#281D3A] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          </div>
        </header>

        {/* Message Feed Canvas */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6">
          
          {/* Welcome Screen / Empty State */}
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto py-8 sm:py-12 flex flex-col items-center text-center animate-fadeIn">
              
              {/* Circular Logo with Glow */}
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#E98245] to-[#D96B27] blur-xl opacity-25 animate-pulse" />
                <div className="relative w-20 h-20 rounded-full overflow-hidden p-1 bg-white dark:bg-[#1D1429] shadow-xl border-2 border-[#E5D5C4] dark:border-[#493B50]">
                  <Image 
                    src="/logo.jpg" 
                    alt="RailAssist AI Logo" 
                    width={80} 
                    height={80} 
                    className="w-full h-full object-cover rounded-full"
                    priority
                  />
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#302638] dark:text-[#FAF5ED] mb-2 tracking-tight">
                How can I help with your journey today?
              </h2>
              <p className="text-xs sm:text-sm text-[#655967] dark:text-[#B8A8BE] max-w-md mb-8 leading-relaxed">
                Specialized exclusively in Indian Railways. Grounded in 5,208 scheduled trains, 8,990 stations, and Ministry of Railways Gazette notifications.
              </p>

              {/* 4 Clickable Suggestion Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {STARTER_PROMPTS.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(card.prompt)}
                      className="group flex flex-col justify-between p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1428] border border-[#E5D5C4] dark:border-[#382A4A] hover:border-[#E98245] dark:hover:border-[#E98245] shadow-sm hover:shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#F4E9DC] dark:bg-[#281D3A] text-[#E98245]">
                            {card.tag}
                          </span>
                          <Icon className="w-4 h-4 text-[#7E6E82] dark:text-[#9A89A2] group-hover:text-[#E98245] transition-colors" />
                        </div>
                        <h3 className="text-xs font-bold text-[#302638] dark:text-[#FAF5ED] mb-1">
                          {card.title}
                        </h3>
                        <p className="text-[11px] text-[#655967] dark:text-[#B8A8BE] leading-snug">
                          &ldquo;{card.prompt}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#E98245] mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Ask RailAssist</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Render Active Conversation Messages */}
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div 
                key={m.id}
                className={`flex gap-3 max-w-3xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-white dark:bg-[#20172E] border border-[#E5D5C4] dark:border-[#3E2D52] flex-shrink-0 mt-0.5">
                    <Image 
                      src="/logo.jpg" 
                      alt="RailAssist AI" 
                      width={32} 
                      height={32} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Message Bubble Body */}
                <div className={`flex flex-col gap-1.5 max-w-[88%] sm:max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  <div 
                    className={`rounded-2xl px-4 py-3 shadow-sm transition-colors text-xs sm:text-[13px] leading-relaxed ${
                      isUser
                        ? 'bg-[#E98245] text-white rounded-br-none font-medium'
                        : 'bg-[#FFFFFF] dark:bg-[#1D152B] border border-[#E5D5C4] dark:border-[#382A4A] text-[#302638] dark:text-[#FAF5ED] rounded-bl-none w-full'
                    }`}
                  >
                    {/* Real-time Status Pulse (if streaming status active) */}
                    {m.statusText && (
                      <div className="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#E98245] animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{m.statusText}</span>
                      </div>
                    )}

                    {/* Markdown Formatted Content */}
                    <ChatMessageMarkdown content={m.content} isUser={isUser} />

                    {/* Typewriter Blinking Cursor */}
                    {m.isStreaming && (
                      <span className="inline-block w-1.5 h-4 ml-1 bg-[#E98245] animate-pulse align-middle" />
                    )}

                    {/* Sources Citation Accordion */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#E5D5C4]/70 dark:border-[#382A4A]/70">
                        <button
                          onClick={() => toggleSources(m.id)}
                          className="flex items-center justify-between w-full text-[11px] font-semibold text-[#7E6E82] dark:text-[#A797B0] hover:text-[#E98245] transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#E98245]" />
                            <span>Verified Sources & Citations ({m.sources.length})</span>
                          </span>
                          {expandedSources[m.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {expandedSources[m.id] && (
                          <div className="mt-2 space-y-1.5 animate-fadeIn">
                            {m.sources.map((src, sIdx) => (
                              <div 
                                key={sIdx}
                                className="p-2 rounded-lg bg-[#FAF5ED] dark:bg-[#140E20] border border-[#E5D5C4] dark:border-[#382A4A] text-[11px]"
                              >
                                <div className="flex items-center justify-between font-bold text-[#E98245] mb-0.5">
                                  <span>{src.title}</span>
                                  <span className="text-[10px] text-[#7E6E82] dark:text-[#8D7D96] font-normal">{src.file_source}</span>
                                </div>
                                <p className="text-[#655967] dark:text-[#B8A8BE] line-clamp-2">
                                  {src.snippet}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Bottom Toolbar (Copy & Regenerate) */}
                  {!isUser && !m.isStreaming && (
                    <div className="flex items-center gap-2 text-[11px] text-[#7E6E82] dark:text-[#9A89A2] px-1">
                      <span>{m.timestamp}</span>

                      <span>•</span>

                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="flex items-center gap-1 hover:text-[#E98245] transition-colors p-1"
                        title="Copy answer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <span>•</span>

                      <button
                        onClick={handleRegenerate}
                        disabled={isLoading}
                        className="flex items-center gap-1 hover:text-[#E98245] transition-colors p-1 disabled:opacity-50"
                        title="Regenerate response"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  )}

                  {/* Contextual Suggested Follow-up Chips */}
                  {!isUser && !m.isStreaming && m.suggestedFollowups && m.suggestedFollowups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1 pt-1">
                      {m.suggestedFollowups.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSendMessage(chip)}
                          className="text-[11px] font-medium py-1 px-2.5 rounded-full bg-[#FAF5ED] dark:bg-[#20172E] border border-[#E5D5C4] dark:border-[#382A4A] text-[#4F4254] dark:text-[#D1C3D8] hover:border-[#E98245] hover:text-[#E98245] dark:hover:border-[#E98245] transition-all"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E98245] to-[#D96B27] text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 mt-0.5">
                    {user?.full_name ? user.full_name[0].toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* =========================================================================
            BOTTOM AUTO-EXPANDING CHAT INPUT
            ========================================================================= */}
        <div className="p-3 sm:p-4 border-t border-[#E5D5C4] dark:border-[#382A4A] bg-[#FAF5ED]/90 dark:bg-[#150F21]/90 backdrop-blur-md">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end rounded-2xl bg-white dark:bg-[#1D152B] border border-[#E5D5C4] dark:border-[#382A4A] shadow-sm focus-within:border-[#E98245] focus-within:ring-2 focus-within:ring-[#E98245]/20 transition-all p-1.5">
              
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask RailAssist AI about trains, timetables, routes, refunds, Tatkal..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent border-0 resize-none px-3 py-2 text-xs sm:text-sm text-[#302638] dark:text-[#FAF5ED] placeholder-[#7E6E82] dark:placeholder-[#9A89A2] focus:outline-none focus:ring-0 max-h-[160px] min-h-[40px] leading-relaxed"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center flex-shrink-0 ${
                  inputValue.trim() && !isLoading
                    ? 'bg-gradient-to-r from-[#E98245] to-[#D96B27] text-white shadow-sm hover:scale-105 active:scale-95'
                    : 'bg-[#EBDDCF] dark:bg-[#281D3A] text-[#9A89A2] dark:text-[#655967] cursor-not-allowed'
                }`}
                title="Send inquiry (Enter)"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#E98245]" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Grounding & Help Disclaimer */}
            <div className="flex items-center justify-between text-[11px] text-[#7E6E82] dark:text-[#9A89A2] mt-2 px-1">
              <span>Enter to send • Shift + Enter for new line</span>
              <span className="hidden sm:inline">24x7 Emergency Rail Madad Helpline: <strong>139</strong></span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#E98245]" />
          <span className="text-xs font-semibold text-[#655967] dark:text-[#B8A8BE]">Loading RailAssist Assistant...</span>
        </div>
      </div>
    }>
      <ChatGPTAssistant />
    </Suspense>
  );
}
