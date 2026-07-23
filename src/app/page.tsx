'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  Heart, CheckCircle2, Mail, Users, LayoutGrid, QrCode,
  ArrowRight, Star, MessageCircle, Quote, MapPin, Calendar as CalendarIcon
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Scroll reveal                                                      */
/* ------------------------------------------------------------------ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(24px)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
      suppressHydrationWarning
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Palette                                                             */
/* ------------------------------------------------------------------ */
const WINE = '#4A1224'
const WINE_LIGHT = '#6B2038'
const CREAM = '#FBF6EE'
const GOLD = '#C9A227'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [envelopeOpen, setEnvelopeOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    const t = setTimeout(() => setEnvelopeOpen(true), 700)
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(t) }
  }, [])

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ backgroundColor: CREAM }}>

      {/* ============================================================ */}
      {/*  NAV                                                          */}
      {/* ============================================================ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'backdrop-blur-xl shadow-sm' : ''
        }`}
        style={{ backgroundColor: scrolled ? 'rgba(251,246,238,0.92)' : 'transparent' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-serif-display font-bold"
              style={{ backgroundColor: WINE, color: GOLD }}
            >
              WI
            </span>
            <span className="font-serif-display font-semibold text-lg tracking-tight" style={{ color: WINE }}>
              Wedding Invyte
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium transition hidden sm:block"
              style={{ color: WINE }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="wine-btn text-sm text-white px-5 py-2.5 rounded-full font-medium transition shadow-sm"
              style={{ backgroundColor: WINE }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  HERO — split layout with envelope reveal                     */}
      {/* ============================================================ */}
      <section className="relative pt-36 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <Reveal>
            <p
              className="font-script text-xl mb-3"
              style={{ color: GOLD }}
            >
              For couples who want it done right
            </p>
            <h1
              className="font-serif-display text-5xl md:text-6xl font-semibold leading-[1.1] mb-6 tracking-tight"
              style={{ color: WINE }}
            >
              Wedding planning,
              <br />
              <span className="gold-shimmer italic">without the chaos.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-9 max-w-md leading-relaxed">
              Send elegant digital invitations, watch RSVPs arrive in
              real time, and organise seating from a single dashboard —
              built by a small studio that cares about weddings as much
              as you do.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/signup"
                className="wine-btn group inline-flex items-center gap-2 text-white px-9 py-4 rounded-full font-medium text-base transition shadow-lg"
                style={{ backgroundColor: WINE, boxShadow: `0 12px 30px -8px ${WINE}66` }}
              >
                Start Planning — Free
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-9 py-4 rounded-full font-medium text-base border transition"
                style={{ borderColor: `${WINE}30`, color: WINE }}
              >
                Sign In
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-8 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {['E', 'K', 'A'].map((l, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-medium text-white"
                    style={{ backgroundColor: [WINE, WINE_LIGHT, GOLD][i] }}
                  >
                    {l}
                  </span>
                ))}
              </div>
              <span>Trusted by couples planning their big day right now</span>
            </div>
          </Reveal>

          {/* Right — envelope + card mockup */}
          <Reveal delay={150}>
            <div className="relative max-w-sm mx-auto" style={{ perspective: '1200px' }}>
              {/* Envelope back */}
              <div
                className="relative rounded-2xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: WINE }}
              >
                {/* Envelope flap */}
                <div
                  className="absolute top-0 left-0 right-0 origin-top transition-transform duration-1000 ease-out z-20"
                  style={{
                    height: '55%',
                    transform: envelopeOpen ? 'rotateX(-170deg)' : 'rotateX(0deg)',
                    transformStyle: 'preserve-3d',
                    background: `linear-gradient(160deg, ${WINE_LIGHT}, ${WINE})`,
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  }}
                />

                <div className="pt-20 pb-10 px-8 text-center relative z-10">
                  <p className="font-script text-2xl mb-1" style={{ color: GOLD }}>
                    Emma
                  </p>
                  <p className="text-white/40 text-xs uppercase tracking-[0.3em] my-1">&amp;</p>
                  <p className="font-script text-2xl" style={{ color: GOLD }}>
                    James
                  </p>
                  <div className="w-10 h-px mx-auto my-5" style={{ backgroundColor: `${GOLD}60` }} />
                  <p className="text-white/70 text-xs tracking-wide">06 . 12 . 2026</p>
                </div>
              </div>

              {/* Card that rises from behind */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-[86%] rounded-xl bg-white shadow-2xl overflow-hidden transition-all duration-1000"
                style={{
                  bottom: envelopeOpen ? '-15%' : '2%',
                  opacity: envelopeOpen ? 1 : 0,
                  zIndex: 5,
                }}
              >
                <div className="p-5 text-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: GOLD }}>
                    Kindly Reply
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="flex-1 h-px" style={{ backgroundColor: `${WINE}25` }} />
                    <Heart size={11} style={{ color: WINE }} fill={WINE} />
                    <div className="flex-1 h-px" style={{ backgroundColor: `${WINE}25` }} />
                  </div>
                  <p className="text-xs text-gray-400 mb-1">You are cordially invited,</p>
                  <p className="font-serif-display font-semibold text-sm mb-4" style={{ color: WINE }}>
                    Kwame Mensah
                  </p>
                  <button
                    className="w-full py-2.5 rounded-full text-white text-xs font-medium"
                    style={{ backgroundColor: WINE }}
                  >
                    RSVP Now
                  </button>
                </div>
              </div>

              {/* Floating live badge */}
              <div
                className="absolute -right-6 top-8 bg-white rounded-xl shadow-xl px-3 py-2.5 border hidden md:flex items-center gap-2"
                style={{ borderColor: `${WINE}15`, animation: 'softFloat 5s ease-in-out infinite' }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
                  <CheckCircle2 size={14} className="text-green-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-800">RSVP received</p>
                  <p className="text-[9px] text-gray-400">2 mins ago</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TRUST STRIP                                                  */}
      {/* ============================================================ */}
      <section className="py-8 px-6 border-y" style={{ borderColor: `${WINE}12` }}>
        <Reveal>
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm" style={{ color: `${WINE}99` }}>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={13} style={{ color: GOLD }} fill={GOLD} />
              ))}
              <span className="ml-2 font-medium" style={{ color: WINE }}>Rated by real couples</span>
            </div>
            <span style={{ color: `${WINE}30` }}>•</span>
            <span className="flex items-center gap-1.5">
              <MessageCircle size={14} /> Invitations sent over WhatsApp &amp; Email
            </span>
            <span style={{ color: `${WINE}30` }}>•</span>
            <span>Guests need nothing but the link</span>
          </div>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/*  WHY COUPLES CHOOSE US — dark band                            */}
      {/* ============================================================ */}
      <section className="py-24 px-6" style={{ backgroundColor: WINE }}>
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="font-script text-xl mb-2" style={{ color: GOLD }}>
              What changes for you
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl font-semibold text-white tracking-tight">
              A calmer way to plan
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'No more guest-list spreadsheets',
                desc: 'Every name, number, and RSVP lives in one place — searchable, editable, always up to date.',
              },
              {
                title: 'No more "did they get the invite?"',
                desc: 'See exactly who opened their invitation and who has responded, the moment it happens.',
              },
              {
                title: 'No more seating chart guesswork',
                desc: 'Drag guests onto tables visually, track capacity as you go, and print the chart when ready.',
              },
            ].map(({ title, desc }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="border-t pt-6" style={{ borderColor: `${GOLD}40` }}>
                  <h3 className="font-serif-display text-white text-lg font-medium mb-2">{title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  ITINERARY-STYLE FEATURE LIST                                 */}
      {/* ============================================================ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="font-script text-xl mb-2" style={{ color: GOLD }}>
              Everything, in order
            </p>
            <h2 className="font-serif-display text-4xl font-semibold tracking-tight" style={{ color: WINE }}>
              From first invite to last dance
            </h2>
          </Reveal>

          <div className="relative pl-8">
            <div
              className="absolute left-[11px] top-2 bottom-2 w-px"
              style={{ backgroundColor: `${WINE}20` }}
            />
            {[
              { icon: Mail, time: 'Step 1', title: 'Send invitations', desc: 'Personalised links go out over WhatsApp or email — each one opens a branded invitation card.' },
              { icon: CheckCircle2, time: 'Step 2', title: 'Track every RSVP', desc: 'Responses land on your dashboard instantly, with dietary notes and messages attached.' },
              { icon: Users, time: 'Step 3', title: 'Manage your guest list', desc: 'Add, edit, or bulk-import guests. Everything stays organised in one searchable list.' },
              { icon: LayoutGrid, time: 'Step 4', title: 'Plan the seating', desc: 'Drag and drop guests onto tables, watch capacity update live, then print the chart.' },
              { icon: QrCode, time: 'Step 5', title: 'Check guests in', desc: 'On the day itself, check arrivals off a live list — no clipboard required.' },
            ].map(({ icon: Icon, time, title, desc }, i) => (
              <Reveal key={title} delay={i * 90}>
                <div className="relative mb-10 last:mb-0">
                  <div
                    className="absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: CREAM, border: `2px solid ${WINE}` }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: WINE }} />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: GOLD }}>
                    {time}
                  </p>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${WINE}0d` }}
                    >
                      <Icon size={18} style={{ color: WINE }} />
                    </div>
                    <div>
                      <h3 className="font-serif-display font-semibold text-lg mb-1" style={{ color: WINE }}>
                        {title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DETAILS CARD — dress code / rsvp deadline style mock          */}
      {/* ============================================================ */}
      <section className="py-24 px-6" style={{ backgroundColor: `${WINE}06` }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="font-script text-xl mb-2" style={{ color: GOLD }}>
              Guests see it too
            </p>
            <h2 className="font-serif-display text-3xl md:text-4xl font-semibold mb-5 tracking-tight" style={{ color: WINE }}>
              An invitation that feels like an invitation
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              No generic forms. Guests open a link and see your names, your
              photo, your venue, and your RSVP deadline in bold — the same
              warmth as a printed card, with none of the printing.
            </p>
            <ul className="space-y-3">
              {[
                'Cover photo and couple photo, your choice',
                'Custom or default wording — you control it',
                'Impossible-to-miss RSVP deadline',
                'Directions and venue map built in',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={16} style={{ color: WINE }} className="mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={150}>
            <div
              className="rounded-2xl overflow-hidden shadow-xl mx-auto max-w-xs"
              style={{ border: `1px solid ${WINE}20` }}
            >
              <div className="p-5 text-center" style={{ backgroundColor: '#fff' }}>
                <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: GOLD }}>
                  Request the pleasure of your company
                </p>
                <div className="flex items-center justify-center gap-2 mb-1" style={{ color: WINE }}>
                  <CalendarIcon size={13} />
                  <p className="text-sm font-medium">Saturday, Dec 20 2026</p>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-4">
                  <MapPin size={11} /> The Grand Ballroom, Accra
                </div>
                <div
                  className="rounded-xl p-3 mb-4 border-2"
                  style={{ borderColor: WINE, backgroundColor: `${WINE}0d` }}
                >
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: WINE }}>
                    RSVP Deadline
                  </p>
                  <p className="font-serif-display font-bold" style={{ color: WINE }}>
                    Nov 1, 2026
                  </p>
                </div>
                <button className="w-full py-3 rounded-full text-white text-sm font-medium" style={{ backgroundColor: WINE }}>
                  RSVP Now
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TESTIMONIAL                                                  */}
      {/* ============================================================ */}
      <section className="py-24 px-6">
        <Reveal className="max-w-2xl mx-auto text-center">
          <Quote size={26} style={{ color: GOLD }} className="mx-auto mb-6" />
          <blockquote className="font-serif-display text-2xl md:text-3xl font-medium leading-relaxed mb-6 italic" style={{ color: WINE }}>
            "It felt less like software and more like someone had
            actually planned a wedding before building it."
          </blockquote>
          <p className="text-gray-400 text-sm">— Abena &amp; Kweku, Accra</p>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={14} style={{ color: GOLD }} fill={GOLD} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/*  FINAL CTA                                                    */}
      {/* ============================================================ */}
      <section className="py-24 px-6" style={{ backgroundColor: WINE }}>
        <Reveal className="max-w-xl mx-auto text-center">
          <p className="font-script text-2xl mb-3" style={{ color: GOLD }}>
            Your wedding, your way
          </p>
          <h2 className="font-serif-display text-4xl md:text-5xl font-semibold text-white mb-5 tracking-tight">
            Let's get you organised
          </h2>
          <p className="text-white/60 mb-9 text-lg">
            Set up your wedding page in minutes. No credit card,
            no learning curve — just less to worry about.
          </p>
          <Link
            href="/signup"
            className="wine-btn inline-flex items-center gap-2 px-10 py-4 rounded-full font-medium text-lg transition"
            style={{ backgroundColor: GOLD, color: WINE }}
          >
            Create Your Wedding — Free
            <ArrowRight size={19} />
          </Link>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="py-10 px-6 border-t" style={{ borderColor: `${WINE}12` }}>
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-serif-display font-bold"
                style={{ backgroundColor: WINE, color: GOLD }}
              >
                WI
              </span>
              <span className="font-serif-display font-semibold" style={{ color: WINE }}>Wedding Invyte</span>
            </div>
            <p className="font-script text-base" style={{ color: `${WINE}80` }}>
              Every love story deserves a beautiful invitation.
            </p>
            <div className="flex items-center gap-6 text-sm" style={{ color: `${WINE}80` }}>
              <Link href="/login" className="hover:opacity-70 transition">Sign In</Link>
              <Link href="/signup" className="hover:opacity-70 transition">Get Started</Link>
            </div>
          </div>
          <p className="text-xs" style={{ color: `${WINE}50` }}>
            Wedding Invyte by{' '}
            <a
              href="https://dennisasante.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-70 transition"
            >
              Dennis Asante
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}