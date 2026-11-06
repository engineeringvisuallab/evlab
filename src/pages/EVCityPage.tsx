import evcityLogo from '@/assets/evcity/evcity-logo.png'
import { EVCITY_URL } from '@/data/evcity'

/**
 * EVCity — a game that is really an engineering simulation.
 *
 * EVLab only shows the image and the idea. The game itself is hosted
 * separately; clicking the image opens it.
 */

const IDEAS: { title: string; text: string }[] = [
  {
    title: 'Real physics, not animation',
    text: 'Cars have an engine, gearbox, suspension and brakes. Boats float by Archimedes’ buoyancy. Helicopters, aircraft and trains follow their own physics.',
  },
  {
    title: 'A city that actually works',
    text: 'Railway network, airport and seaport, a dam, water supply and wastewater plants, a power substation, a thermal power plant and a renewable energy park.',
  },
  {
    title: 'Mechanical & automation labs',
    text: 'Vehicle and aircraft factories, and a production line with sensors, a PLC, a robot arm and a PID-controlled tank — all running live.',
  },
  {
    title: 'Guided engineering tours',
    text: 'Visit any engineering site and a narrated tour explains what you are looking at and why it is designed that way.',
  },
]

export function EVCityPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      {/* The image is the only link to the game. */}
      <a
        href={EVCITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the EVCity game"
        className="group relative block overflow-hidden rounded-3xl border border-[var(--border-color)] shadow-2xl transition-all hover:border-cyan-400/70 hover:shadow-cyan-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
      >
        <div className="relative flex aspect-[16/8] w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,#0f2a3a_0%,#08111d_65%,#050811_100%)] p-8 sm:p-14">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <img
            src={evcityLogo}
            alt="EVCity — Engineering Visual City"
            className="relative w-full max-w-xl transition-transform duration-300 group-hover:scale-105"
            draggable={false}
          />
        </div>
      </a>

      <section className="mt-12 text-center">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
          A game that is really an engineering simulation
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
          EVCity is an open-world city you can walk, drive, sail and fly through — but every system in
          it is built on real engineering rules. Learn Civil, Mechanical and Electrical engineering by
          playing, not by reading.
        </p>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {IDEAS.map((idea) => (
          <div
            key={idea.title}
            className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5"
          >
            <h2 className="text-sm font-bold text-[var(--text-primary)]">{idea.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{idea.text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
