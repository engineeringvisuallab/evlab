import { useState } from 'react'
import type { FC, FormEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { modNewsletterMail } from '@/assets/images'
import svgWater from '@/assets/evlab-home/disciplines/water.svg'
import svgCivil from '@/assets/evlab-home/disciplines/civil.svg'
import svgEnvironmental from '@/assets/evlab-home/disciplines/environmental.svg'
import svgMechanical from '@/assets/evlab-home/disciplines/mechanical.svg'
import svgElectrical from '@/assets/evlab-home/disciplines/electrical.svg'
import svgAgricultural from '@/assets/evlab-home/disciplines/agricultural.svg'
import svgUrbanPlanning from '@/assets/evlab-home/disciplines/urban-planning.svg'
import svgGis from '@/assets/evlab-home/disciplines/gis.svg'
import svgMoreDisciplines from '@/assets/evlab-home/disciplines/more-disciplines.svg'

export interface BottomDisciplinesNewsletterProps {
  onNavigate: (sectionId: string, paramOrFieldId?: string) => void
}

export const BottomDisciplinesNewsletter: FC<BottomDisciplinesNewsletterProps> = ({
  onNavigate,
}) => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setTimeout(() => setSubscribed(false), 4000)
      setEmail('')
    }
  }

  // 9 Engineering Disciplines Pedestals
  const disciplines = [
    {
      id: 'water-resources',
      title: 'Water Resources',
      color: 'from-cyan-500 to-blue-600',
      ring: 'border-cyan-500/40 shadow-cyan-500/20',
      svg: svgWater,
    },
    {
      id: 'civil-engineering',
      title: 'Civil Engineering',
      color: 'from-blue-500 to-slate-600',
      ring: 'border-blue-500/40 shadow-blue-500/20',
      svg: svgCivil,
    },
    {
      id: 'environmental',
      title: 'Environmental',
      color: 'from-emerald-500 to-green-600',
      ring: 'border-emerald-500/40 shadow-emerald-500/20',
      svg: svgEnvironmental,
    },
    {
      id: 'mechanical',
      title: 'Mechanical',
      color: 'from-slate-400 to-cyan-600',
      ring: 'border-cyan-500/40 shadow-cyan-500/20',
      svg: svgMechanical,
    },
    {
      id: 'electrical',
      title: 'Electrical',
      color: 'from-amber-400 to-green-500',
      ring: 'border-amber-500/40 shadow-amber-500/20',
      svg: svgElectrical,
    },
    {
      id: 'agricultural',
      title: 'Agricultural',
      color: 'from-green-400 to-emerald-600',
      ring: 'border-green-500/40 shadow-green-500/20',
      svg: svgAgricultural,
    },
    {
      id: 'urban-planning',
      title: 'Urban Planning',
      color: 'from-purple-500 to-cyan-500',
      ring: 'border-purple-500/40 shadow-purple-500/20',
      svg: svgUrbanPlanning,
    },
    {
      id: 'gis-remote-sensing',
      title: 'GIS & Remote Sensing',
      color: 'from-cyan-400 to-indigo-600',
      ring: 'border-cyan-500/40 shadow-cyan-500/20',
      svg: svgGis,
    },
    {
      id: 'more-disciplines',
      title: 'More Disciplines',
      color: 'from-purple-500 to-pink-500',
      ring: 'border-purple-500/40 shadow-purple-500/20',
      svg: svgMoreDisciplines,
    },
  ]

  return (
    <section id="disciplines-and-stay-connected" className="py-6 lg:py-8 bg-[#070B14] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT COLUMN: Explore by Engineering Disciplines (7 cols on desktop) */}
          <div className="lg:col-span-7 p-5 rounded-3xl bg-[#090E1B]/95 border border-slate-800/90 shadow-xl flex flex-col justify-between space-y-4">
            <h3 className="text-xs font-bold text-slate-100 font-sans tracking-wide">
              Explore by Engineering Disciplines
            </h3>

            {/* 9 Glowing 3D Pedestal Icons Row */}
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 items-center text-center">
              {disciplines.map((d) => (
                <div
                  key={d.id}
                  onClick={() => onNavigate('roadmap', d.id === 'more-disciplines' ? '' : d.id)}
                  className="flex flex-col items-center space-y-2 p-1 rounded-xl hover:bg-slate-800/60 transition-all cursor-pointer group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-900 to-[#070D1C] border p-1 flex items-center justify-center group-hover:scale-110 transition-all shadow-lg ${d.ring}`}
                  >
                    <img
                      src={d.svg}
                      alt={d.title}
                      className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium font-sans leading-tight group-hover:text-cyan-300 transition-colors line-clamp-2 h-6 flex items-center justify-center">
                    {d.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Stay Connected (5 cols on desktop) */}
          <div className="lg:col-span-5 p-5 rounded-3xl bg-[#090E1B]/95 border border-slate-800/90 shadow-xl flex items-center justify-between gap-4">
            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
                  Stay Connected
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans mt-0.5">
                  Get updates on new tools, courses and engineering resources.
                </p>
              </div>

              {/* Form Input + Subscribe Button */}
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 transition-all cursor-pointer shrink-0"
                >
                  Subscribe
                </button>
              </form>

              {subscribed && (
                <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed successfully!
                </p>
              )}
            </div>

            {/* Photorealistic Holographic Mail Render */}
            <div className="w-28 h-28 shrink-0 hidden sm:flex items-center justify-center p-1 relative rounded-2xl overflow-hidden bg-[#060912] border border-slate-800">
              <img
                src={modNewsletterMail}
                alt="Stay Connected"
                className="w-full h-full object-cover filter contrast-[1.05]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
