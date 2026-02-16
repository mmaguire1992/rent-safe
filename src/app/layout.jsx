import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import AuthProviderWrapper from '@/components/providers/AuthProviderWrapper'
import WishlistProviderWrapper from '@/components/providers/WishlistProviderWrapper'
import PaymentStatusProviderWrapper from '@/components/providers/PaymentStatusProviderWrapper'
import ReduxProvider from '@/components/providers/ReduxProvider'
import { ToastContainer } from 'react-toastify'

export const metadata = {
  title: 'RentSafe',
  description: 'RentSafe - Property Rental Platform',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ReduxProvider>
        <AuthProviderWrapper>
          <WishlistProviderWrapper>
            <PaymentStatusProviderWrapper>
              {children}
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </PaymentStatusProviderWrapper>
          </WishlistProviderWrapper>
        </AuthProviderWrapper>
        </ReduxProvider>
      </body>
    </html>
  )
}
