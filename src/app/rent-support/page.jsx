'use client'

import { useEffect } from 'react'
import { useNavigate } from '@/lib/react-router-compat'

// Backward-compatible renter route: the real Support page lives at `/support`.
export default function RentSupportRedirectPage() {
  const navigate = useNavigate()
  
  useEffect(() => {
    navigate('/support', { replace: true })
  }, [navigate])
  
  return null
}


