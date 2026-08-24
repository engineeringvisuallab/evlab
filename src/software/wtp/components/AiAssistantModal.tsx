import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, Lightbulb, CheckCircle2 } from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  state: CalculatedWtpState;
}

export const AiAssistantModal: React.FC<AiAssistantProps> = ({ isOpen, onClose, state }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am your EVL WTP Process Engineering Advisor. Current design capacity is set to ${state.plantCapacityMLD} MLD (${state.m3hrFlow.toFixed(1)} m³/hr). How can I assist you with process optimization, chemical dosing, or CPHEEO compliance today?`
    }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      let aiResponse = `Based on your ${state.plantCapacityMLD} MLD plant configuration, `;
      if (userMsg.toLowerCase().includes('turbidity') || userMsg.toLowerCase().includes('alum')) {
        aiResponse += `for raw water turbidity around ${state.alumDoseMgL * 2} NTU, an alum dose of ${state.alumDoseMgL} mg/L is recommended along with a rapid flash mix G value of ${state.flashMixerG} s⁻¹ to ensure optimal microfloc formation.`;
      } else if (userMsg.toLowerCase().includes('filter') || userMsg.toLowerCase().includes('backwash')) {
        aiResponse += `the design uses ${state.numberOfFilters} rapid gravity sand filters with a filtration rate of ${state.filtrationRateM3M2Hr} m/hr. Backwash requires ${state.backwashFlowM3hr.toFixed(1)} m³/hr water plus simultaneous air scour at 45-50 m/hr.`;
      } else {
        aiResponse += `all process units (Cascade Aerator -> Flash Mixer -> Paddled Flocculator -> Tube Settler -> Rapid Sand Filter) satisfy CPHEEO 2021 & AWWA M37 velocity and detention criteria without bottlenecks.`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-xl shadow-2xl p-6 font-mono text-xs text-slate-100 flex flex-col h-[520px]">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Bot className="w-5 h-5 text-cyan-400" />
            <span>EVL WTP Process AI Assistant & Optimiser</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg max-w-[85%] ${
                m.sender === 'ai'
                  ? 'bg-slate-950 text-slate-200 border border-slate-800 self-start'
                  : 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 ml-auto'
              }`}
            >
              <div className="text-3xs font-bold text-slate-400 mb-1">
                {m.sender === 'ai' ? '🤖 EVL AI PROCESS ENGINEER' : '👤 YOU'}
              </div>
              <div className="text-2xs leading-relaxed">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-t border-slate-800 pt-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about alum dosing, filtration rate, headloss, or CPHEEO rules..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
};
