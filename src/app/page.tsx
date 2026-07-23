'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  Heart, CheckCircle2, Mail, Users, LayoutGrid, QrCode,
  Sparkles, ArrowRight, Star, MessageCircle, Quote
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Scroll reveal hook                                                 */
/* ------------------------------------------------------------------ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, visible }
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={
        visible
          ? { opacity: 1, transform: 'translateY(0px)', transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }
          : { opacity: 0, transform: 'translateY(28px)' }
      }
      suppressHydrationWarning
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Floating decorative petal / sparkle                                */
/* ------------------------------------------------------------------ */
function Floaty({
  children,
  className = '',
  duration = 6,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
}) {
  return (
    <div
      className={`absolute pointer-events-none select-none ${className}`}
      style={{
        animation: `floaty ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#FFFBF5] font-sans overflow-x-hidden">
      
      {/* ============================================================ */}
      {/*  NAV                                                          */}
      {/* ============================================================ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-sm border-b border-amber-100'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💍</span>
            <span className="font-display font-bold text-gray-900 text-lg tracking-tight">
              Wedding Invite
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-shine text-sm bg-[#1B2A4A] hover:bg-[#26386b] text-white px-5 py-2.5 rounded-full font-semibold transition shadow-sm hover:shadow-lg hover:shadow-[#1B2A4A]/20"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section className="relative pt-40 pb-28 px-6 text-center overflow-hidden">
        {/* Animated gradient blobs */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-60 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #FDE9C8 0%, #FCEEDB 35%, transparent 70%)',
            animation: 'gradientMove 12s ease-in-out infinite',
            backgroundSize: '200% 200%',
          }}
        />
        <div
          className="absolute top-40 right-0 w-96 h-96 rounded-full opacity-40 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F4C9C9 0%, transparent 70%)' }}
        />

        {/* Floating decorative glyphs */}
        <Floaty className="top-24 left-[8%] text-4xl opacity-70" duration={7}>🌸</Floaty>
        <Floaty className="top-52 right-[10%] text-3xl opacity-60" duration={8} delay={1}>✨</Floaty>
        <Floaty className="bottom-10 left-[15%] text-3xl opacity-50" duration={9} delay={0.5}>💐</Floaty>
        <Floaty className="top-16 right-[22%] text-2xl opacity-60" duration={6} delay={2}>💍</Floaty>

        <div className="relative max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 bg-white border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 uppercase tracking-wider shadow-sm"
            style={{ animation: 'floaty-slow 5s ease-in-out infinite' }}
          >
            <Sparkles size={13} className="text-amber-500" />
            Digital Wedding Invitations, Reimagined
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-gray-900 leading-[1.08] mb-6 tracking-tight">
            Your wedding,
            <br />
            <span className="gradient-text italic">perfectly invited.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Send breathtaking personalised invitations over WhatsApp and email,
            watch RSVPs roll in live, and design your seating chart —
            all from one beautifully simple dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="btn-shine group w-full sm:w-auto bg-[#D4A373] hover:bg-[#c49060] text-white px-10 py-4 rounded-full font-bold text-base transition shadow-xl shadow-amber-300/40 flex items-center justify-center gap-2"
              style={{ animation: 'pulseGlow 2.8s ease-in-out infinite' }}
            >
              Create Your Wedding — Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto border border-gray-200 bg-white/70 backdrop-blur text-gray-700 hover:bg-white px-10 py-4 rounded-full font-semibold text-base transition"
            >
              Sign In
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-5">
            No credit card required · Set up in under 5 minutes
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  INVITATION PREVIEW — floating tilted card                    */}
      {/* ============================================================ */}
      <section className="py-10 px-6 relative">
        <Reveal className="max-w-sm mx-auto relative">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-amber-500 font-bold mb-8">
            What Your Guests Will See
          </p>

          <div className="relative">
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-rose-200 rounded-[2rem] blur-2xl opacity-40 scale-95" />

            <div
              className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/60"
              style={{
                animation: 'floaty-slow 7s ease-in-out infinite',
                transform: 'rotate(-2deg)',
              }}
            >
              <div
                className="h-52 flex flex-col items-center justify-end pb-6 text-center px-4 relative"
                style={{ background: 'linear-gradient(160deg, #A88A63 0%, #5C4A32 100%)' }}
              >
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, white 0%, transparent 50%)' }} />
                <p className="text-white/70 text-xs uppercase tracking-widest mb-2 relative">
                  Together with their families
                </p>
                <h2 className="font-display text-white font-bold text-3xl relative">
                  Emma & James
                </h2>
              </div>
              <div className="bg-[#FEFAE0] p-7 text-center">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-[#D4A373]/40" />
                  <Sparkles size={12} className="text-[#D4A373]" />
                  <div className="flex-1 h-px bg-[#D4A373]/40" />
                </div>
                <p className="text-[#8B7355] text-xs uppercase tracking-widest mb-3 font-semibold">
                  Request the pleasure of your company
                </p>
                <p className="text-gray-700 font-bold text-lg">Saturday</p>
                <p className="text-gray-500 text-sm mb-3">December 20, 2026</p>
                <p className="text-gray-400 text-xs mb-5">📍 The Grand Ballroom, Accra</p>
                <div className="bg-[#D4A373]/10 rounded-2xl p-4 mb-5">
                  <p className="text-xs text-gray-400 mb-0.5">You are invited,</p>
                  <p className="font-bold text-gray-800">Kwame Mensah</p>
                </div>
                <button
                  className="btn-shine w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg shadow-amber-300/50"
                  style={{ backgroundColor: '#D4A373' }}
                >
                  RSVP Now 💌
                </button>
              </div>
            </div>

            {/* floating badge */}
            <div
              className="absolute -right-6 top-16 bg-white rounded-2xl shadow-xl px-4 py-3 border border-amber-100 hidden md:block"
              style={{ animation: 'floaty 5s ease-in-out infinite', animationDelay: '1s' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">RSVP Received</p>
                  <p className="text-[10px] text-gray-400">Just now</p>
                </div>
              </div>
            </div>

            <div
              className="absolute -left-8 bottom-24 bg-white rounded-2xl shadow-xl px-4 py-3 border border-amber-100 hidden md:block"
              style={{ animation: 'floaty 6s ease-in-out infinite', animationDelay: '2s' }}
            >
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-green-500" />
                <p className="text-xs font-bold text-gray-800">Sent via WhatsApp</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/*  SOCIAL PROOF STRIP                                           */}
      {/* ============================================================ */}
      <section className="py-10 px-6 mt-8">
        <Reveal>
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={15} className="text-amber-400 fill-amber-400" />
              ))}
              <span className="ml-2 text-gray-700 font-semibold">Loved by couples</span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5">
              <MessageCircle size={14} className="text-green-500" /> Works on WhatsApp & Email
            </span>
            <span className="text-gray-300">•</span>
            <span>No app download needed for guests</span>
          </div>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                     */}
      {/* ============================================================ */}
      <section className="py-24 px-6 relative">
        <div
          className="absolute top-1/2 left-0 w-72 h-72 rounded-full opacity-30 blur-3xl -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, #E8D5B5 0%, transparent 70%)' }}
        />
        <div className="max-w-6xl mx-auto relative">
          <Reveal className="text-center mb-16">
            <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.2em] mb-3">
              Everything You Need
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              One place for the whole day
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              From the first invite to the last dance — Wedding Invite handles it all
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: 'WhatsApp & Email Invites',
                desc: 'Send personalised invite links directly to your guests via WhatsApp or email. Each link opens a beautiful, branded invitation card.',
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: CheckCircle2,
                title: 'Real-Time RSVP Tracking',
                desc: 'Watch responses arrive live on your dashboard. See who is attending, who declined, and who has not responded yet.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Users,
                title: 'Effortless Guest Management',
                desc: 'Add guests one by one or import hundreds from a spreadsheet. Edit, delete, and organise with bulk actions.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: LayoutGrid,
                title: 'Drag & Drop Seating',
                desc: 'Arrange your reception tables visually. Drag guests onto tables, track seat capacity, and print table cards.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: QrCode,
                title: 'QR Code Invitations',
                desc: 'Generate a QR code for each guest. Print it on physical stationery — guests scan and RSVP in seconds.',
                color: 'bg-rose-50 text-rose-600',
              },
              {
                icon: Heart,
                title: 'Plus-One Control',
                desc: 'Decide who can bring a plus one. Approve or decline requests individually — they are tracked and counted in your seating.',
                color: 'bg-pink-50 text-pink-600',
              },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <Reveal key={title} delay={i * 90}>
                <div className="card-lift bg-white rounded-3xl p-7 border border-gray-100 h-full">
                  <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-5`}>
                    <Icon size={21} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                 */}
      {/* ============================================================ */}
      <section className="py-28 px-6 bg-[#1B2A4A] relative overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #D4A373 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F4C9C9 0%, transparent 70%)' }}
        />
        <div className="max-w-3xl mx-auto relative">
          <Reveal className="text-center mb-16">
            <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.2em] mb-3">
              Simple By Design
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Up and running in minutes
            </h2>
            <p className="text-gray-400 text-lg">No technical knowledge needed — ever</p>
          </Reveal>

          <div className="space-y-5">
            {[
              {
                step: '01',
                title: 'Create your account',
                desc: 'Sign up with your email or Google account. Either the bride or groom creates the account first.',
              },
              {
                step: '02',
                title: 'Set up your wedding in 2 minutes',
                desc: 'Enter your names, wedding date, and venue. Choose a colour theme that matches your wedding aesthetic.',
              },
              {
                step: '03',
                title: 'Invite your partner',
                desc: 'Send an invite link to your partner from Settings. They join with their own account and both of you have full access.',
              },
              {
                step: '04',
                title: 'Add guests and send invites',
                desc: 'Build your guest list and send personalised invite links via WhatsApp. Guests RSVP by tapping the link — no sign up needed.',
              },
            ].map(({ step, title, desc }, i) => (
              <Reveal key={step} delay={i * 100}>
                <div className="flex gap-5 items-start group">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: '#D4A373', color: 'white' }}
                  >
                    {step}
                  </div>
                  <div className="bg-white/5 hover:bg-white/10 rounded-2xl p-5 flex-1 border border-white/10 transition-colors">
                    <h3 className="font-bold text-white mb-1">{title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TESTIMONIAL                                                  */}
      {/* ============================================================ */}
      <section className="py-28 px-6 relative">
        <Floaty className="top-8 left-[12%] text-3xl opacity-40" duration={8}>🌿</Floaty>
        <Floaty className="bottom-8 right-[12%] text-3xl opacity-40" duration={7} delay={1}>🌸</Floaty>
        <Reveal className="max-w-2xl mx-auto text-center relative">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
            <Quote size={22} className="text-amber-400" />
          </div>
          <blockquote className="font-display text-2xl md:text-3xl font-medium text-gray-800 leading-relaxed mb-6 italic">
            "We managed 280 guests without a single spreadsheet.
            Every RSVP came in through WhatsApp and we could
            see everything in real time."
          </blockquote>
          <p className="text-gray-400 text-sm font-medium">
            — Abena &amp; Kweku, Accra · December 2025
          </p>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/*  FINAL CTA                                                    */}
      {/* ============================================================ */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background: 'radial-gradient(ellipse at center, #FDF0DA 0%, #FFFBF5 70%)',
          }}
        />
        <Floaty className="top-10 left-[20%] text-2xl opacity-50" duration={6}>✨</Floaty>
        <Floaty className="bottom-16 right-[18%] text-2xl opacity-50" duration={7} delay={1.5}>💍</Floaty>

        <Reveal className="max-w-xl mx-auto text-center relative">
          <div
            className="text-6xl mb-6 inline-block"
            style={{ animation: 'floaty-slow 4s ease-in-out infinite' }}
          >
            💍
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Ready to plan your wedding?
          </h2>
          <p className="text-gray-500 mb-9 text-lg">
            Join couples across Ghana who are using Wedding Invite
            to create unforgettable wedding experiences.
          </p>
          <Link
            href="/signup"
            className="btn-shine inline-flex items-center gap-2 bg-[#D4A373] hover:bg-[#c49060] text-white px-12 py-4 rounded-full font-bold text-lg transition shadow-2xl shadow-amber-300/50"
            style={{ animation: 'pulseGlow 2.8s ease-in-out infinite' }}
          >
            Create Your Wedding — Free
            <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-gray-400 mt-5">
            No credit card · No technical skills · Cancel anytime
          </p>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="py-10 px-6 border-t border-amber-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💍</span>
            <span className="font-display font-bold text-gray-800">Wedding Invite</span>
          </div>
          <p className="text-sm text-gray-400 italic font-display">
            Every love story deserves a beautiful invitation.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/login" className="hover:text-gray-600 transition">Sign In</Link>
            <Link href="/signup" className="hover:text-gray-600 transition">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
