import { redirect } from 'next/navigation'

export default function SeatingRedirect() {
  redirect('/dashboard/tables')
}