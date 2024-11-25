
import '@/styles/global.css'
import { Metadata } from 'next'

const portal = process.env.PORTAL

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: {
    template: portal === 'ADMIN' ? 'Admin Portal | %s' : 'Backoffice Portal | %s',
    default: portal === 'ADMIN' ? 'Admin Portal' : 'Backoffice Portal'
  }
}