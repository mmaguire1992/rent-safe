export const maskEmail = (email) => {
  if (!email || !email.includes('@')) {
    return email || ''
  }
  
  const [localPart, domain] = email.split('@')
  
  if (localPart.length <= 2) {
    return email
  }
  
  const firstTwo = localPart.slice(0, 2)
  const lastChar = localPart.slice(-1)
  const masked = firstTwo + '*'.repeat(Math.max(3, localPart.length - 3)) + lastChar
  
  return `${masked}@${domain}`
}










