import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '~/app/providers'
import { getSession } from "~/auth"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Proof of Vibes',
  description: 'First vibes to earn platform powered by the worlds best tastemakers',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  )
}
