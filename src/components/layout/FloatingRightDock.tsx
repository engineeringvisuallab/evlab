import React, { useState } from 'react';
import {
  Bot,
  HelpCircle,
  Users,
  MessageSquare,
  Sparkles,
  X,
  Send,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FloatingRightDockProps {
  onNavigate?: (sectionId: string) => void;
}

export const FloatingRightDock: React.FC<FloatingRightDockProps> = ({ onNavigate }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am EVLab Engineering Assistant. Ask me anything about engineering fields, software, design codes, or career roadmaps.',
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let reply = `Great question regarding "${userText}". You can explore our Career Roadmap with 26 fields and 1,465 focus areas or check UELE 3D for interactive digital twin simulations.`;
      if (userText.toLowerCase().includes('water') || userText.toLowerCase().includes('hydraulic')) {
        reply = `For Water Engineering, check out our EPANET & WaterCAD software modules, AWWA standards, and the WTP digital twin in UELE 3D!`;
      } else if (userText.toLowerCase().includes('civil') || userText.toLowerCase().includes('structure')) {
        reply = `For Civil Engineering, explore structural analysis in ETABS, ACI 318 design codes, and AutoCAD cross-sections.`;
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  const dockItems = [
    {
      id: 'chat-ai',
      label: 'Chat AI',
      icon: Bot,
      action: () => setChatOpen(!chatOpen),
      active: chatOpen,
    },
    {
      id: 'help-center',
      label: 'Help Center',
      icon: HelpCircle,
      action: () => onNavigate && onNavigate('about'),
    },
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      action: () => onNavigate && onNavigate('my-engineering'),
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquare,
      action: () => onNavigate && onNavigate('reports'),
    },
  ];

  return (
    <div className="fixed right-3.5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center space-y-3 select-none">
      {/* Vertical Dock Container */}
      <div className="flex flex-col items-center space-y-3.5 p-2 rounded-2xl bg-[#090E1B]/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl">
        {dockItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all cursor-pointer group ${
                item.active
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-sans font-medium text-slate-400 group-hover:text-slate-200">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Floating Purple AI Trigger Button at bottom of dock */}
      <button
        type="button"
        onClick={() => setChatOpen(!chatOpen)}
        className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/40 hover:shadow-purple-600/60 border border-purple-400/50 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all"
        title="Open AI Engineering Assistant"
      >
        <Sparkles className="w-5 h-5 text-white animate-pulse" />
      </button>

      {/* Slide-in / Popup AI Chat Drawer */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed right-16 bottom-12 w-80 sm:w-96 h-[460px] bg-[#090E1B]/95 border border-purple-500/40 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-xl bg-purple-600/30 border border-purple-500/50 text-purple-300">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 font-sans leading-none">
                    EVLab AI Copilot
                  </h4>
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                    ● Online & Ready
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs scrollbar-thin">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about equations, standards, software..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-200 placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
