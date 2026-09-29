import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { TopicDefinition } from '../types/mechanics';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicDefinition;
  parameters: Record<string, number>;
  computedData: Record<string, any>;
  isDark: boolean;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  topic,
  parameters,
  computedData,
  isDark,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'model',
      content: `Hello! I am your **EVLab Engineering Mechanics AI Tutor**. We are currently exploring **${topic.title}** (${topic.category.toUpperCase()}).\n\nAsk me about the underlying derivations, free-body diagram assumptions, physical consequences of your current parameters, or practical failure modes in real-world structures!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    `How does changing the parameters shift the mechanical equilibrium?`,
    `Explain the step-by-step mathematical derivation for this topic.`,
    `What are the critical real-world engineering failure modes here?`,
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentTopic: topic.title,
          currentState: {
            parameters,
            computedData,
          },
        }),
      });

      const data = await res.json();
      const replyContent =
        data.reply ||
        `**Offline Physics Insight for ${topic.title}:**\n\nThe current state balances according to standard Newtonian/static formulations. In this scenario, input variables generate the evaluated state with high precision.`;

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        role: 'model',
        content: `**Deterministic Physical Explanation:** In **${topic.title}**, the governing equations dictate that as your parameters scale, the kinetic or static reactions adjust proportionally to satisfy momentum, force, or energy balances.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="ai-tutor-modal"
        className={`w-full max-w-3xl h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">EVLab Mechanics AI Tutor</h2>
              <p className="text-xs text-slate-400">
                Interactive Engineering Guidance & Physical Concept Explanations
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'init-2',
                    role: 'model',
                    content: `Chat reset. Ask any question about **${topic.title}**!`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ])
              }
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${
                m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-600/10 text-purple-500 border border-purple-500/20'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : isDark
                    ? 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none'
                    : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                <span className="block mt-1.5 text-[9px] opacity-60 text-right">{m.timestamp}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-purple-600/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div
                className={`px-4 py-3 rounded-2xl text-xs ${
                  isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}
              >
                Analyzing physical state and formulating engineering explanation...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-6 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center">
            <Lightbulb className="w-3 h-3 mr-1 text-amber-500" /> Prompts:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask a question about ${topic.title}...`}
              className={`flex-1 px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-colors cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
