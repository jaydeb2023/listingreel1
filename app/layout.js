import './globals.css'
import { Cormorant_Garamond, Outfit } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700'],
  style: ['normal', 'italic'],
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
})

export const metadata = {
  title: 'ListingReel — AI Video Ads for Real Estate',
  description: 'Generate cinematic property video ads in 60 seconds. Free for real estate agents.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${outfit.variable} font-body`}>
        {children}
      </body>
    </html>
  )
}
