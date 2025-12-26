import './globals.css'
import AuthProviderWrapper from '@/components/providers/AuthProviderWrapper'

export const metadata = {
  title: 'RentSafe',
  description: 'RentSafe - Property Rental Platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  )
}
