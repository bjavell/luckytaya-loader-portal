
import '@/styles/global.css'
import { Metadata } from 'next'


export default function RootLayout({
  children,
  title
}: Readonly<{
  children: React.ReactNode,
  title: string
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
    template: 'Loader Portal | %s',
    default: 'Loader Portal'
  }
}