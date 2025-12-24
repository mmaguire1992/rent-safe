'use client'

export default function Error({ error, reset }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary mb-4">Something went wrong!</h2>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-mainBlue text-white rounded-lg"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
