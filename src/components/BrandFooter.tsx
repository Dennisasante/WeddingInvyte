export default function BrandFooter({ dark = false }: { dark?: boolean }) {
  return (
    <p className={`text-center text-xs mt-8 ${dark ? 'text-gray-500' : 'text-gray-300'}`}>
      Made with ❤️ using{' '}
      <span className="font-medium">Wedding Invyte</span>
      {' '}by{' '}
      <a
        href="https://dennisasante.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-amber-500 transition"
      >
        Dennis Asante
      </a>
    </p>
  )
}