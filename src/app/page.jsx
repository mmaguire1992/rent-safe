'use client'

import { useEffect } from 'react'
import { useNavigate } from '@/lib/react-router-compat'
import { isAuthenticated, getUserType } from '@/utils/auth'

export default function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check authentication and redirect accordingly
    if (isAuthenticated()) {
      const userType = getUserType()
      if (userType === 'owner') {
        navigate('/dashboard')
      } else if (userType === 'renter') {
        navigate('/landing')
      } else {
        navigate('/login')
      }
    } else {
      navigate('/login')
    }
  }, [navigate])

  return null
}

