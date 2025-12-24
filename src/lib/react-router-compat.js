'use client'

// Compatibility layer to use Next.js router with react-router-dom API
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation'
import NextLink from 'next/link'
import { useParams as useNextParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// Link compatibility - Next.js Link uses 'href', react-router-dom uses 'to'
export function Link({ to, href, children, className, ...props }) {
  const linkHref = href || to || '#'
  return (
    <NextLink href={linkHref} className={className} {...props}>
      {children}
    </NextLink>
  )
}

// useNavigate compatibility
export function useNavigate() {
  const router = useRouter()
  return (to, options) => {
    if (typeof to === 'string') {
      if (options?.replace) {
        router.replace(to)
      } else {
        router.push(to)
      }
    } else if (typeof to === 'number') {
      router.back()
    }
  }
}

// useLocation compatibility
export function useLocation() {
  const pathname = usePathname()
  const searchParams = useNextSearchParams()
  
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    const params = searchParams.toString()
    setSearch(params ? `?${params}` : '')
  }, [searchParams])
  
  return {
    pathname,
    search,
    hash: '',
    state: null,
    key: 'default'
  }
}

// useParams compatibility
export function useParams() {
  const params = useNextParams()
  return params || {}
}

// useSearchParams compatibility
export function useSearchParams() {
  const nextSearchParams = useNextSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // Create a URLSearchParams object from Next.js searchParams
  const params = new URLSearchParams()
  nextSearchParams.forEach((value, key) => {
    params.set(key, value)
  })
  
  const setSearchParams = (updater, options) => {
    const newParams = new URLSearchParams(params)
    
    if (typeof updater === 'function') {
      const result = updater(newParams)
      if (result instanceof URLSearchParams) {
        // If updater returns URLSearchParams, use it directly
        const search = result.toString()
        const newUrl = search ? `${pathname}?${search}` : pathname
        
        if (options?.replace) {
          router.replace(newUrl)
        } else {
          router.push(newUrl)
        }
      } else if (result && typeof result === 'object') {
        // If updater returns an object, apply it
        Object.entries(result).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') {
            newParams.delete(key)
          } else {
            newParams.set(key, String(value))
          }
        })
        const search = newParams.toString()
        const newUrl = search ? `${pathname}?${search}` : pathname
        
        if (options?.replace) {
          router.replace(newUrl)
        } else {
          router.push(newUrl)
        }
      }
    } else if (typeof updater === 'object' && !(updater instanceof URLSearchParams)) {
      Object.entries(updater).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          newParams.delete(key)
        } else {
          newParams.set(key, String(value))
        }
      })
      const search = newParams.toString()
      const newUrl = search ? `${pathname}?${search}` : pathname
      
      if (options?.replace) {
        router.replace(newUrl)
      } else {
        router.push(newUrl)
      }
    }
  }
  
  return [params, setSearchParams]
}

// Navigate component compatibility
export function Navigate({ to, replace = false }) {
  const router = useRouter()
  
  useEffect(() => {
    if (replace) {
      router.replace(to)
    } else {
      router.push(to)
    }
  }, [to, replace, router])
  
  return null
}

