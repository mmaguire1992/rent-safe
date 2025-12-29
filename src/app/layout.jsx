import './globals.css'
import AuthProviderWrapper from '@/components/providers/AuthProviderWrapper'
import ReduxProvider from '@/components/providers/ReduxProvider'

export const metadata = {
  title: 'RentSafe',
  description: 'RentSafe - Property Rental Platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ReduxProvider>
          <AuthProviderWrapper>
            {children}
          </AuthProviderWrapper>
        </ReduxProvider>
      </body>
    </html>
  )
}
