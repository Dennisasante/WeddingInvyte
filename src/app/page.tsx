import Link from 'next/link'
import { Heart, CheckCircle, Mail, Users, Table2, QrCode, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💍</span>
            <span className="font-bold text-gray-900 text-lg tracking-tight">Wedding Invite</span>
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
              className="text-sm bg-[#1B2A4A] hover:bg-[#263a63] text-white px-5 py-2.5 rounded-full font-semibold transition shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-rose-100 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 uppercase tracking-wider">
            <Heart size={12} fill="currentColor" />
            Digital Wedding Invitations
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
            Your wedding,
            <br />
            <span className="text-[#D4A373]">perfectly invited.</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Send beautiful personalized invitations via WhatsApp and email.
            Track RSVPs in real time. Manage seating. All from one
            elegant dashboard — no technical skills needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-[#D4A373] hover:bg-[#c49060] text-white px-10 py-4 rounded-full font-bold text-base transition shadow-lg shadow-amber-200/50"
            >
              Create Your Wedding — Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto border border-gray-200 text-gray-700 hover:bg-gray-50 px-10 py-4 rounded-full font-semibold text-base transition"
            >
              Sign In
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            No credit card required · Set up in under 5 minutes
          </p>
        </div>
      </section>

      {/* Invitation Preview Card */}
      <section className="py-16 px-6">
        <div className="max-w-sm mx-auto">
          <p className="text-center text-xs uppercase tracking-widest text-gray-400 font-semibold mb-6">
            What your guests will see
          </p>
          {/* Mock invitation card */}
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            <div
              className="h-48 flex flex-col items-center justify-end pb-6 text-center px-4"
              style={{
                background: 'linear-gradient(to bottom, #8B7355 0%, #5C4A32 100%)'
              }}
            >
              <p className="text-white/70 text-xs uppercase tracking-widest mb-2">
                Together with their families
              </p>
              <h2 className="text-white font-bold text-2xl">Emma & James</h2>
            </div>
            <div className="bg-[#FEFAE0] p-6 text-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[#D4A373]/40" />
                <span className="text-[#D4A373] text-xs">✦</span>
                <div className="flex-1 h-px bg-[#D4A373]/40" />
              </div>
              <p className="text-[#8B7355] text-xs uppercase tracking-widest mb-3 font-medium">
                Request the pleasure of your company
              </p>
              <p className="text-gray-700 font-semibold mb-1">Saturday</p>
              <p className="text-gray-500 text-sm mb-3">December 20, 2026</p>
              <p className="text-gray-400 text-xs mb-4">📍 The Grand Ballroom, Accra</p>
              <div className="bg-[#D4A373]/10 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-400 mb-0.5">You are invited,</p>
                <p className="font-bold text-gray-800">Kwame Mensah</p>
              </div>
              <button
                className="w-full py-3 rounded-2xl text-white font-bold text-sm"
                style={{ backgroundColor: '#D4A373' }}
              >
                RSVP Now 💌
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
              ))}
              <span className="ml-2 text-gray-600 font-medium">Loved by couples</span>
            </div>
            <span>·</span>
            <span>Works on WhatsApp & Email</span>
            <span>·</span>
            <span>No app download needed for guests</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything in one place
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              From the first invite to the last dance — Wedding Invite handles it all
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: 'WhatsApp & Email Invites',
                desc: 'Send personalized invite links directly to your guests via WhatsApp or email. Each link opens a beautiful, branded invitation card.',
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: CheckCircle,
                title: 'Real-Time RSVP Tracking',
                desc: 'Watch responses arrive live on your dashboard. See who is attending, who declined, and who has not responded yet.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Users,
                title: 'Easy Guest Management',
                desc: 'Add guests one by one or import hundreds from a spreadsheet. Edit, delete, and organise with bulk actions.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Table2,
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
                title: 'Plus One Control',
                desc: 'Decide who can bring a plus one. Approve or decline requests individually. Plus ones are tracked and counted in your seating.',
                color: 'bg-pink-50 text-pink-600',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-amber-200 hover:shadow-md transition group"
              >
                <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center mb-5`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-[#1B2A4A]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Up and running in minutes
            </h2>
            <p className="text-gray-400 text-lg">
              No technical knowledge needed — ever
            </p>
          </div>

          <div className="space-y-6">
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
                desc: 'Build your guest list and send personalized invite links via WhatsApp. Guests RSVP by tapping the link — no sign up needed.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5 items-start">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: '#D4A373', color: 'white' }}
                >
                  {step}
                </div>
                <div className="bg-white/5 rounded-2xl p-5 flex-1 border border-white/10">
                  <h3 className="font-bold text-white mb-1">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-6">💬</div>
          <blockquote className="text-2xl font-medium text-gray-800 leading-relaxed mb-6 italic">
            "We managed 280 guests without a single spreadsheet.
            Every RSVP came in through WhatsApp and we could
            see everything in real time."
          </blockquote>
          <p className="text-gray-400 text-sm font-medium">
            — Abena & Kweku, Accra · December 2025
          </p>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-xl mx-auto text-center">
          <div className="text-5xl mb-6">💍</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Ready to plan your wedding?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join couples across Ghana who are using Wedding Invite
            to create unforgettable wedding experiences.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[#D4A373] hover:bg-[#c49060] text-white px-12 py-4 rounded-full font-bold text-lg transition shadow-xl shadow-amber-200/60"
          >
            Create Your Wedding — Free
          </Link>
          <p className="text-sm text-gray-400 mt-4">
            No credit card · No technical skills · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💍</span>
            <span className="font-bold text-gray-800">Wedding Invite</span>
          </div>
          <p className="text-sm text-gray-400">
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
