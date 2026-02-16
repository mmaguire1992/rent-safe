'use client'

import { WishlistProvider } from '@/context/WishlistContext'

export default function WishlistProviderWrapper({ children }) {
  return <WishlistProvider>{children}</WishlistProvider>
}
