'use client'

// Compatibility layer to use Next.js router with react-router-dom API
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation'
import NextLink from 'next/link'
import { useParams as useNextParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// Link compatibility - Next.js Link uses 'href', react-router-dom uses 'to'
export function Link({ to, href, children, className, ...props }) {
  const router = useRouter()
  const linkHref = href || to || '#'

  const handleClick = (e) => {
    // Allow consumer handlers first
    if (typeof props.onClick === 'function') {
      props.onClick(e)
    }
    if (e.defaultPrevented) return

    // Respect new-tab / modified clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (props.target === '_blank') return
    // Only intercept left clicks
    if (typeof e.button === 'number' && e.button !== 0) return

    const bypassBlocker = props?.__bypassBlocker === true
    const blocker =
      (typeof window !== 'undefined' && window.__rentsafe_navBlocker)
        ? window.__rentsafe_navBlocker
        : null

    if (
      !bypassBlocker &&
      blocker &&
      typeof blocker.shouldBlock === 'function' &&
      blocker.shouldBlock() &&
      typeof blocker.request === 'function'
    ) {
      e.preventDefault()
      blocker.request({
        to: linkHref,
        options: { replace: !!props.replace },
        kind: 'push',
        proceed: () => {
          if (props.replace) {
            router.replace(linkHref)
          } else {
            router.push(linkHref)
          }
        },
      })
    }
  }

  return (
    <NextLink href={linkHref} className={className} {...props} onClick={handleClick}>
      {children}
    </NextLink>
  )
}

// useNavigate compatibility
export function useNavigate() {
  const router = useRouter()
  return (to, options) => {
    // Internal options used by our app (not part of react-router-dom API)
    const bypassBlocker = options?.__bypassBlocker === true
    const afterNavigate = typeof options?.__afterNavigate === 'function' ? options.__afterNavigate : null

    // Navigation blocker (set by pages like Add/Edit Property to confirm before leaving)
    // Shape:
    // window.__rentsafe_navBlocker = { shouldBlock: () => boolean, request: ({ to, options, kind, proceed }) => void }
    const blocker = (typeof window !== 'undefined' && window.__rentsafe_navBlocker) ? window.__rentsafe_navBlocker : null

    const doNavigate = () => {
      // Strip internal-only fields so they don't leak elsewhere
      const safeOptions = options && typeof options === 'object'
        ? (() => {
            const { __bypassBlocker, __afterNavigate, ...rest } = options
            return rest
          })()
        : options

      if (typeof to === 'string') {
        if (safeOptions?.replace) {
          router.replace(to)
        } else {
          router.push(to)
        }
      } else if (typeof to === 'number') {
        router.back()
      } else {
        // Handle unexpected types - log error and default to login
        console.error('Invalid navigation target:', to);
        router.push('/login')
      }

      // Run post-navigation side-effect (e.g., deferred logout clear)
      if (afterNavigate) {
        try { afterNavigate() } catch (e) { /* ignore */ }
      }
    }

    if (!bypassBlocker && blocker && typeof blocker.shouldBlock === 'function' && blocker.shouldBlock()) {
      if (typeof blocker.request === 'function') {
        blocker.request({
          to,
          options,
          kind: typeof to === 'number' ? 'back' : 'push',
          proceed: () => doNavigate(),
        })
        return
      }
    }

    if (typeof to === 'string') {
      doNavigate()
      return
    }
    if (typeof to === 'number') {
      doNavigate()
      return
    }
    doNavigate()
  }
}

// usePathname compatibility - re-export from Next.js
export { usePathname }

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
  
  // Ensure pathname is always a string
  const currentPathname = typeof pathname === 'string' ? pathname : String(pathname || '')
  
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
        const newUrl = search ? `${currentPathname}?${search}` : currentPathname
        
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
        const newUrl = search ? `${currentPathname}?${search}` : currentPathname
        
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
      const newUrl = search ? `${currentPathname}?${search}` : currentPathname
      
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

