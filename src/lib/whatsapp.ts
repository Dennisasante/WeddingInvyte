// Turns a Ghana number in any format (0244…, +233 24…, 233…) into the
// international digits wa.me expects, or '' if there isn't a usable number.
export function whatsappDigits(phone: string | null | undefined): string {
  const d = (phone || '').replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('233')) return d
  if (d.length === 10 && d.startsWith('0')) return '233' + d.slice(1)
  if (d.length === 9) return '233' + d
  return ''
}

// wa.me link that opens a chat with the guest (or the share picker if we
// have no number) with the message ready to send.
export function whatsappUrl(phone: string | null | undefined, text: string): string {
  const encoded = encodeURIComponent(text)
  const digits = whatsappDigits(phone)
  return digits ? `https://wa.me/${digits}?text=${encoded}` : `https://wa.me/?text=${encoded}`
}
