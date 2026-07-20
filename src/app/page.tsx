import Link from 'next/link'
import { Heart, CheckCircle, Mail, Users, Table2, QrCode } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">

      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💍</span>
          <span className="font-bold text-gray-800 text-lg">WeddingInvite</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Heart size={12} fill="currentColor" />
          Beautiful digital wedding invitations
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
          Your wedding,
          <span className="text-amber-500"> beautifully</span>
          <br />invited.
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Create stunning digital invitations, track RSVPs in real time,
          manage seating, and give your guests an unforgettable experience
          — all from one simple dashboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition shadow-lg shadow-amber-200"
          >
            Create Your Wedding 💍
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto border border-gray-200 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-2xl font-medium text-lg transition"
          >
            Sign In
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Free to get started — no credit card required
        </p>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Everything you need
        </h2>
        <p className="text-center text-gray-400 mb-12">
          From invitations to seating — all in one place
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Mail,
              title: 'Beautiful Invitations',
              desc: 'Send personalized invite links via WhatsApp or email. Each link opens a stunning invitation card themed to your wedding.',
            },
            {
              icon: CheckCircle,
              title: 'Real-Time RSVP Tracking',
              desc: 'Watch responses come in live. Track who is attending, who declined, and who still needs to respond.',
            },
            {
              icon: Users,
              title: 'Guest Management',
              desc: 'Add guests one by one or import hundreds from a CSV. Edit, delete, and organize with ease.',
            },
            {
              icon: Table2,
              title: 'Drag & Drop Seating',
              desc: 'Assign guests to tables with a simple drag and drop. Print your seating chart and table cards.',
            },
            {
              icon: QrCode,
              title: 'QR Code Invites',
              desc: 'Generate QR codes for each guest. Perfect for physical stationery — scan to RSVP instantly.',
            },
            {
              icon: Heart,
              title: 'Plus One System',
              desc: 'Control who can bring a plus one. Approve or decline requests and track plus one details.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-amber-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Get started in minutes
          </h2>
          <p className="text-center text-gray-400 mb-12">
            No technical knowledge needed
          </p>
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Create your account',
                desc: 'Sign up with your email or Google account. Either the bride or groom can create the account first.',
              },
              {
                step: '2',
                title: 'Set up your wedding',
                desc: 'Enter your names, wedding date, venue, and choose a theme. Takes less than 2 minutes.',
              },
              {
                step: '3',
                title: 'Invite your partner',
                desc: 'Send an invite link to your partner so you both have access to manage the wedding together.',
              },
              {
                step: '4',
                title: 'Add guests and send invites',
                desc: 'Build your guest list and send personalized invitation links via WhatsApp or email.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {step}
                </div>
                <div className="bg-white rounded-2xl p-5 flex-1 border border-amber-100">
                  <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-5xl mb-6">💍</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to plan your perfect wedding?
          </h2>
          <p className="text-gray-400 mb-8">
            Join couples who have used WeddingInvite to create
            unforgettable wedding experiences.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 rounded-2xl font-bold text-lg transition shadow-lg shadow-amber-200"
          >
            Create Your Wedding — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-100 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>💍</span>
          <span className="font-medium text-gray-600">WeddingInvite</span>
        </div>
        <p>Every love story deserves a beautiful invitation.</p>
      </footer>

    </div>
  )
}