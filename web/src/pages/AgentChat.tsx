import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { BotAvatar } from '@/components/BotAvatar';
import { t } from '@/lib/i18n';
import type { WsMessage } from '@/types/api';
import { WebSocketClient } from '@/lib/ws';
import { getToken } from '@/lib/auth';
import { generateUUID } from '@/lib/uuid';
import { useDraft } from '@/hooks/useDraft';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

const DRAFT_KEY = 'agent-chat';

export default function AgentChat() {
  const { draft, saveDraft, clearDraft } = useDraft(DRAFT_KEY);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(draft);
  const [typing, setTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocketClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const pendingContentRef = useRef('');

  const renderMessageContent = useCallback((content: string) => {
    const token = getToken();
    const parts = content.split(/(screenshot_[\w\d_-]+\.png)/gi);
    
    return parts.map((part, i) => {
      if (part.match(/^screenshot_[\w\d_-]+\.png$/i)) {
        const url = `/api/workspace/${part}${token ? `?token=${token}` : ''}`;
        return (
          <button
            key={i}
            onClick={() => setActiveImageUrl(url)}
            className="text-accent-blue hover:text-accent-blue/80 font-mono bg-accent-blue/5 px-1.5 py-0.5 rounded border border-accent-blue/10 mx-0.5 transition-all hover:bg-accent-blue/10 active:scale-95 inline-flex items-center gap-1 group/link"
          >
            {part}
            <ExternalLink className="h-3 w-3 opacity-50 group-hover/link:opacity-100 transition-opacity" />
          </button>
        );
      }
      return part;
    });
  }, []);

  // Persist draft to in-memory store so it survives route changes
  useEffect(() => {
    saveDraft(input);
  }, [input, saveDraft]);

  useEffect(() => {
    const ws = new WebSocketClient();

    ws.onOpen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onClose = () => {
      setConnected(false);
    };

    ws.onError = () => {
      setError(t('agent.error_connection'));
    };

    ws.onMessage = (msg: WsMessage) => {
      switch (msg.type) {
        case 'chunk':
          setTyping(true);
          pendingContentRef.current += msg.content ?? '';
          break;

        case 'message':
        case 'done': {
          const content = msg.full_response ?? msg.content ?? pendingContentRef.current;
          if (content) {
            const screenshotMatch = content.match(/screenshot_[\w\d_-]+\.png/i);
            let imageUrl;
            if (screenshotMatch) {
              const filename = screenshotMatch[0];
              const token = getToken();
              imageUrl = `/api/workspace/${filename}${token ? `?token=${token}` : ''}`;
            }

            setMessages((prev) => [
              ...prev,
              {
                id: generateUUID(),
                role: 'agent',
                content,
                timestamp: new Date(),
                imageUrl,
              },
            ]);
          }
          pendingContentRef.current = '';
          setTyping(false);
          break;
        }

        case 'tool_call':
          setMessages((prev) => [
            ...prev,
            {
              id: generateUUID(),
              role: 'agent',
              content: `[${t('agent.tool_call')}] ${msg.name ?? 'unknown'}(${JSON.stringify(msg.args ?? {})})`,
              timestamp: new Date(),
            },
          ]);
          break;

        case 'tool_result': {
          const content = msg.output ?? '';
          const screenshotMatch = content.match(/screenshot_[\w\d_-]+\.png/i);
          let imageUrl;
          if (screenshotMatch) {
            const filename = screenshotMatch[0];
            const token = getToken();
            imageUrl = `/api/workspace/${filename}${token ? `?token=${token}` : ''}`;
          }

          setMessages((prev) => [
            ...prev,
            {
              id: generateUUID(),
              role: 'agent',
              content: `[${t('agent.tool_result')}] ${content}`,
              timestamp: new Date(),
              imageUrl,
            },
          ]);
          break;
        }

        case 'error':
          setMessages((prev) => [
            ...prev,
            {
              id: generateUUID(),
              role: 'agent',
              content: `[${t('doctor.error')}] ${msg.message ?? 'Unknown error'}`,
              timestamp: new Date(),
            },
          ]);
          setTyping(false);
          pendingContentRef.current = '';
          break;
      }
    };

    ws.connect();
    wsRef.current = ws;

    return () => {
      ws.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !wsRef.current?.connected) return;

    setMessages((prev) => [
      ...prev,
      {
        id: generateUUID(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      },
    ]);

    try {
      wsRef.current.sendMessage(trimmed);
      setTyping(true);
      pendingContentRef.current = '';
    } catch {
      setError(t('agent.error_send'));
    }

    setInput('');
    clearDraft();
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleCopy = useCallback((msgId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId((prev) => (prev === msgId ? null : prev)), 2000);
    });
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] relative">
      {/* Image Preview Modal */}
      {activeImageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveImageUrl(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img 
              src={activeImageUrl} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => window.open(activeImageUrl, '_blank')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors border border-white/20"
              >
                <ExternalLink className="h-4 w-4" />
                {t('common.open_new_tab')}
              </button>
              <button
                onClick={() => setActiveImageUrl(null)}
                className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors shadow-lg shadow-accent-blue/20"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection status bar */}
      {error && (
        <div className="px-4 py-2 bg-status-error/15 border-b border-status-error/30 flex items-center gap-2 text-sm text-status-error animate-fade-in">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-text-muted animate-fade-in">
            <div className="h-16 w-16 mb-4 animate-float">
              <BotAvatar className="h-full w-full drop-shadow-[0_0_20px_var(--accent-red)]" />
            </div>
            <p className="text-lg font-semibold text-text-primary mb-1">{t('agent.welcome_title')}</p>
            <p className="text-sm text-text-muted">{t('agent.welcome_subtitle')}</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`group flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse animate-slide-in-right' : 'animate-slide-in-left'
            }`}
            style={{ animationDelay: `${Math.min(idx * 30, 200)}ms` }}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-accent-blue'
                  : 'overflow-hidden'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="h-4 w-4 text-white" />
              ) : (
                <BotAvatar className="h-full w-full" />
              )}
            </div>
            <div className="relative max-w-[75%]">
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'text-white bg-accent-blue'
                    : 'text-text-primary bg-bg-card border border-border-default'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words">{renderMessageContent(msg.content)}</div>
                {msg.imageUrl && (
                  <div className="mt-3 relative group/img">
                    <img 
                      src={msg.imageUrl} 
                      alt="Screenshot" 
                      className="rounded-xl max-w-full h-auto cursor-pointer border border-border-default/50 hover:border-accent-blue/40 transition-all duration-300 shadow-sm hover:shadow-md"
                      onClick={() => setActiveImageUrl(msg.imageUrl!)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors rounded-xl pointer-events-none" />
                  </div>
                )}
                <p
                  className={`text-[10px] mt-1.5 ${
                    msg.role === 'user' ? 'text-white/50' : 'text-text-muted'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => handleCopy(msg.id, msg.content)}
                aria-label={t('common.copy')}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-300 p-1.5 rounded-lg bg-bg-primary border border-border-default text-text-muted hover:text-text-primary hover:border-accent-blue/40"
              >
                {copiedId === msg.id ? (
                  <Check className="h-3 w-3 text-status-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl overflow-hidden">
              <BotAvatar className="h-full w-full" />
            </div>
            <div className="rounded-2xl px-4 py-3 border border-border-default bg-bg-card">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border-default/40 p-4 bg-bg-secondary/50 backdrop-blur-md">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={connected ? t('agent.placeholder') : t('agent.connecting')}
              disabled={!connected}
              className="input-electric w-full px-4 py-3 text-sm resize-none overflow-y-auto disabled:opacity-40"
              style={{ minHeight: '44px', maxHeight: '200px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!connected || !input.trim()}
            className="btn-electric flex-shrink-0 p-3 rounded-xl"
            title={t('agent.send')}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-center mt-2 gap-2">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full glow-dot ${
              connected ? 'text-status-success bg-status-success' : 'text-status-error bg-status-error'
            }`}
          />
          <span className="text-[10px] text-text-muted">
            {connected ? t('agent.connected') : t('agent.disconnected')}
          </span>
        </div>
      </div>
    </div>
  );
}
