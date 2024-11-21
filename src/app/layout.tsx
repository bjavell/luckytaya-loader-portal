
import '@/styles/global.css'
import { Metadata } from 'next'


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

export const metadata:Metadata = {
  title: {
    template: 'Admin Portal | %s',
    default: 'Admin Portal'
  }
}