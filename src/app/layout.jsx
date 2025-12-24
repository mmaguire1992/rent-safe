import './globals.css'

export const metadata = {
  title: 'RentSafe',
  description: 'RentSafe - Property Rental Platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
