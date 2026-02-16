'use client'

import { PaymentStatusProvider } from '@/context/PaymentStatusContext'

export default function PaymentStatusProviderWrapper({ children }) {
  return <PaymentStatusProvider>{children}</PaymentStatusProvider>
}
