/**
 * EVLab AI Fluid Mechanics Engineering Tutor & Problem Solver Panel
 * Powered by Gemini with Multi-Turn Chat, Deep Thinking Mode, and Textbook Problem Solvers.
 */

import React, { useState, useRef, useEffect } from 'react';
import { LabTopicId, FluidProperty } from '../../types';
import { Send, Sparkles, Brain, Bot, User, RotateCcw, Lightbulb, AlertCircle } from 'lucide-react';

interface AiFluidTutorPanelProps {
  labId: LabTopicId;
  parameters: Record<string, any>;
  results: Record<string, any>;
  fluid: FluidProperty;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  thinkingMode?: boolean;
}

export const AiFluidTutorPanel: React.FC<AiFluidTutorPanelProps> = ({
  labId,
  parameters,
  results,
  fluid,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-0',
      role: 'assistant',
      content: `Hello! I am your **EVLab Fluid Mechanics AI Tutor**.\n\nI can help you solve textbook problems, explain physical fluid phenomena (Bernoulli, Reynolds transitions, hydraulic jumps, Moody friction factors), and review your current simulation parameters.\n\n*What question or engineering problem would you like to explore today?*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinkingMode, setUseThinkingMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputPrompt.trim();
    if (!promptToSend || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thinkingMode: useThinkingMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptToSend,
          thinkingMode: useThinkingMode,
          context: {
            labId,
            parameters,
            results,
            fluid: {
              name: fluid.name,
              temperature: fluid.temperature,
              density: fluid.density,
              dynamicViscosity: fluid.dynamicViscosity,
              vaporPressure: fluid.vaporPressure,
            },
          },
          history: messages.slice(1).map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.reply) {
        const assistantMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'No reply received from server.');
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `**Error communicating with AI Tutor:** ${err.message || 'Server connection error.'}. Please verify network settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    `Explain the physical difference between HGL and EGL.`,
    `Why is Reynolds number 2300 the critical threshold?`,
    `Check if current parameters pose any cavitation risk.`,
    `Derive the hydraulic jump conjugate depth formula.`,
  ];

  return (
    <div className="flex flex-col h-[520px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
              <span>Gemini Fluid Mechanics Tutor</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </h4>
            <div className="text-[10px] text-slate-400 font-mono">Multi-turn reasoning & problem solving</div>
          </div>
        </div>

        {/* Thinking Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setUseThinkingMode(!useThinkingMode)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              useThinkingMode
                ? 'bg-amber-950/80 text-amber-300 border border-amber-700/80 shadow-sm'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
            title="Enable Deep Thinking Reasoning Mode"
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">{useThinkingMode ? 'Thinking ON' : 'Standard'}</span>
          </button>

          <button
            onClick={() =>
              setMessages([
                {
                  id: 'msg-reset',
                  role: 'assistant',
                  content: `Conversation reset. How can I assist you with your fluid mechanics simulations?`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            className="p-1 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
            title="Reset Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-slate-50 font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
              }`}
            >
              {msg.thinkingMode && msg.role === 'user' && (
                <div className="text-[10px] text-sky-200 font-mono flex items-center space-x-1 mb-1">
                  <Brain className="w-3 h-3" />
                  <span>Thinking mode enabled</span>
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div
                className={`text-[9px] font-mono mt-1 ${
                  msg.role === 'user' ? 'text-sky-200 text-right' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-6 h-6 rounded-full bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 flex-shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-slate-400 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Analyzing fluid equations and evaluating parameters...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-850 flex items-center space-x-2 overflow-x-auto pb-2">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            disabled={isLoading}
            className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={`Ask about ${labId} calculations, formulas, or textbook problems...`}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-750 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="p-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
