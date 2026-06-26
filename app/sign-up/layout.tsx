import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider afterSignOutUrl="/sign-in">{children}</ClerkProvider>
}
