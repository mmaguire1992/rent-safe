'use client'

import { useEffect } from 'react'
import { useNavigate } from '@/lib/react-router-compat'
import { isAuthenticated, getUserType } from '@/utils/auth'
import LandingPage from '@/components/pages/LandingPage'

export default function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    // Only redirect authenticated users, unauthenticated users see landing page
    if (isAuthenticated()) {
      const userType = getUserType()
      if (userType === 'owner') {
        navigate('/dashboard')
      } else if (userType === 'renter') {
        navigate('/landing')
      } else {
        navigate('/login')
      }

    }
    // If not authenticated, show landing page (no redirect)
  }, [navigate])

  // Show landing page for unauthenticated users
  if (!isAuthenticated()) {
    return <LandingPage />
  }

  // Return null while redirecting authenticated users
  return null
}


