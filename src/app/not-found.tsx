import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">💍</div>
        <h1 className="font-poppins text-6xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">
          Page not found
        </h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium transition"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}