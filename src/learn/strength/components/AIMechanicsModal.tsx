import React, { useState } from 'react';
import { CalculationState, Material, SectionProperties, TopicData } from '../types';
import { formatEngValue } from '../core/units';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  Cpu, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface AIMechanicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicData;
  material: Material;
  section: SectionProperties;
  calcState: CalculationState;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  category?: 'explanation' | 'calculation' | 'failure_analysis' | 'recommendation';
}

export const AIMechanicsModal: React.FC<AIMechanicsModalProps> = ({
  isOpen,
  onClose,
  topic,
  material,
  section,
  calcState,
}) => {
  if (!isOpen) return null;

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello! I am your EVLab AI Mechanics Professor. I am actively monitoring your current experiment on "${topic.title}" with ${material.name} using ${section.name}. How can I assist you with derivations, stress verification, failure diagnostics, or design optimization today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    `Why does changing beam depth h impact deflection so much more than width b?`,
    `Diagnose my current stress state and safety margin.`,
    `What are the key assumptions behind Euler's buckling theory?`,
    `How does Mohr's circle transform shear and normal stresses physically?`,
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery.trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');

    // Generate intelligent mechanics physics response based on current experiment context
    setTimeout(() => {
      let aiResponseText = '';

      const lower = query.toLowerCase();
      if (lower.includes('depth') || lower.includes('height') || lower.includes('b vs h')) {
        aiResponseText = `### Cubic Stiffness & Quadratic Strength Scaling

In beam mechanics, the moment of inertia for a rectangular cross-section is:
$$I_x = \\frac{b \\cdot h^3}{12}$$

1. **Deflection Reduction ($\\delta \\propto 1/h^3$):** Because depth $h$ is cubed, doubling the beam depth ($2\\times h$) increases bending stiffness $E I$ by **$8\\times$ ($2^3$)**, causing elastic deflection to drop by **$87.5\\%$** under identical loading.
2. **Stress Reduction ($\\sigma \\propto 1/h^2$):** Section modulus $Z_x = \\frac{b \\cdot h^2}{6}$ scales quadratically, dropping peak bending stress by **$75\\%$** ($4\\times$).
3. **Weight Efficiency:** Doubling width $b$ only doubles stiffness ($2\\times$), whereas doubling depth gives $8\\times$ stiffness for the exact same cross-sectional area and weight. This is why wide-flange I-beams place the vast majority of material in the extreme flanges far from the neutral axis.`;
      } else if (lower.includes('diagnose') || lower.includes('safety') || lower.includes('current state')) {
        const topicId = topic.id;
        if (topicId === 'beam_bending' || topicId === 'flexural_stress' || topicId === 'beam_deflection') {
          const sf = calcState.beam.safetyFactor;
          const maxStress = calcState.beam.maxFlexuralStressMPa;
          const maxDef = calcState.beam.maxDeflectionMm;
          aiResponseText = `### Real-Time Structural Diagnosis for ${topic.title}

- **Material:** ${material.name} (Yield Strength $\\sigma_y = ${material.yieldStrength}$ MPa, $E = ${material.E}$ GPa)
- **Active Section:** ${section.name} ($I_x = ${formatEngValue(section.Ix)}$ mm⁴, $Z_x = ${formatEngValue(section.Zx)}$ mm³)
- **Max Flexural Stress:** $\\sigma_{\\max} = ${formatEngValue(maxStress)}$ MPa (Utilization: ${(maxStress / material.yieldStrength * 100).toFixed(1)}%)
- **Max Deflection:** $\\delta_{\\max} = ${formatEngValue(maxDef)}$ mm (Span/Deflection Ratio: $L/${Math.round((calcState.beamSpanLengthM * 1000) / Math.max(0.01, maxDef))}$)
- **Safety Factor:** $SF = ${formatEngValue(sf)}$ (${sf >= 1.5 ? 'COMPLIANT with standard design codes' : sf >= 1.0 ? 'MARGINAL - Consider increasing section depth' : 'OVERLOADED - Material Yielding Predicted'})

**Recommendation:** ${sf < 1.5 ? 'Upgrade to a deeper standard section (e.g. W310x79) or shorten unsupported span length.' : 'Current structural capacity is well within AISC / Eurocode allowable limits.'}`;
        } else if (topicId === 'columns_buckling') {
          const pCr = calcState.buckling.criticalBucklingLoadKN;
          const sf = calcState.buckling.bucklingSafetyFactor;
          const lambda = calcState.buckling.slendernessRatio;
          aiResponseText = `### Euler Column Buckling Diagnosis

- **Effective Length Factor ($K$):** ${calcState.buckling.kFactor} (${calcState.columnEndCondition.replace('_', '-').toUpperCase()})
- **Slenderness Ratio ($\\lambda = KL/r$):** ${lambda.toFixed(1)}
- **Euler Critical Load ($P_{cr}$):** ${formatEngValue(pCr)} kN
- **Applied Compression ($P$):** ${calcState.columnAxialLoadKN} kN
- **Buckling Safety Factor:** $SF = ${formatEngValue(sf)}$ (${calcState.buckling.isBuckled ? 'CRITICAL BUCKLING INSTABILITY OCCURRING' : 'STABLE'})

**Governing Failure Mode:** ${calcState.buckling.governingMode === 'buckling' ? 'Geometric Elastic Instability (Euler Buckling governs before material yield)' : 'Material Crushing / Yielding governs'}.`;
        } else if (topicId === 'torsion') {
          aiResponseText = `### Torsional Shaft Diagnosis

- **Applied Torque:** ${calcState.torsionTorqueKNm} kN·m
- **Max Shear Stress ($\\tau_{\\max} = Tc/J$):** ${formatEngValue(calcState.torsion.maxShearStressMPa)} MPa
- **Angle of Twist ($\\theta = TL/GJ$):** ${calcState.torsion.angleTwistDeg.toFixed(2)}° (${calcState.torsion.angleTwistRad.toFixed(4)} rad)
- **Safety Factor against Shear:** $SF = ${formatEngValue(calcState.torsion.safetyFactor)}$

**Physical Note:** Notice how shear stress is zero at the center core and maximum at the perimeter. Using a hollow tube with identical steel volume increases polar moment $J$ by over $2.5\\times$.`;
        } else {
          aiResponseText = `### Current Stress Analysis: ${topic.title}

- **Material:** ${material.name} ($\\sigma_y = ${material.yieldStrength}$ MPa, $E = ${material.E}$ GPa)
- **Section:** ${section.name} (Area $A = ${section.area}$ mm²)
- **Direct Normal Stress:** $\\sigma = P/A = ${formatEngValue(calcState.axial.stressMPa)}$ MPa
- **Safety Factor:** $SF = ${formatEngValue(calcState.axial.safetyFactor)}$

All calculations follow linear elastic constitutive equations within Hooke's proportional range.`;
        }
      } else if (lower.includes('mohr') || lower.includes('transformation')) {
        aiResponseText = `### Mohr's Circle Physical Mechanics

1. **Why $2\\theta$ instead of $\\theta$:** In physical space, orthogonal planes are oriented at $90^\\circ$ to each other. On Mohr's circle, the normal stress state on plane $X$ and plane $Y$ lie on opposite ends of a diameter ($180^\\circ$ apart). Thus, physical rotation $\\theta$ maps directly to angular rotation $2\\theta$ on the circle.
2. **Principal Planes ($\\tau = 0$):** Where the circle intercepts the horizontal $\\sigma$-axis, shear stress is identically zero. These correspond to the **Principal Stresses $\\sigma_1$ and $\\sigma_2$**.
3. **Maximum Shear ($\\tau_{\\max} = R$):** The top and bottom apex points of the circle represent maximum in-plane shear stress, occurring on planes rotated $45^\\circ$ from the principal planes.`;
      } else if (lower.includes('euler') || lower.includes('buckl')) {
        aiResponseText = `### Euler Buckling Assumptions & Governing Physics

1. **Concentric Axial Loading:** Resultant compression passes precisely through the cross-section centroid without eccentricity.
2. **Prismatic & Perfectly Straight:** Initial member has no initial crookedness or residual fabrication stresses.
3. **Slenderness Threshold:** Euler's formula applies only when slenderness $\\lambda = KL/r \\ge \\lambda_c = \\pi \\sqrt{E / \\sigma_y}$. For shorter columns, the Johnson parabola or tangent modulus theory must be used because material yielding occurs before bifurcation.
4. **Weak-Axis Rule:** Columns always buckle about their minor axis ($I_{\\min} = \\min(I_x, I_y)$) unless intermediate lateral bracing restricts minor-axis deflection.`;
      } else {
        aiResponseText = `### Engineering Analysis on ${topic.title}

Based on fundamental mechanics of materials principles:
- **Governing Equation:** ${topic.governingFormula}
- **Standard Reference:** ${topic.standardRef}

**Key Physical Takeaways:**
1. Stresses distribute internally according to kinematic compatibility and cross-sectional geometric resistance ($A$, $I$, $Z$, $J$).
2. Deformations scale with material stiffness ($E$ or $G$) and geometry.
3. In multi-axial states, always compare equivalent von Mises or Tresca stresses against the material yield limit $\\sigma_y$.

Feel free to ask for step-by-step problem calculations or scenario sensitivity!`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-slate-100 font-mono">
                  EVLab AI Mechanics Professor
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 font-semibold">
                  Engineering AI Assistant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Active Topic: <strong className="text-cyan-400">{topic.title}</strong> • {material.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/60 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="p-1.5 rounded-md bg-blue-900/60 border border-blue-700/50 text-blue-300 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.text}
                </div>
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800/80 overflow-x-auto">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">
              Quick Questions:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-blue-950/80 border border-slate-800 hover:border-blue-700/60 text-[11px] text-slate-300 hover:text-blue-200 transition shrink-0 whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center space-x-2">
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask any mechanics question, derivation, stress check, or code rule..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim()}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 transition"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
