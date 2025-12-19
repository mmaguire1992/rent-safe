import { FaHome } from 'react-icons/fa'

function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
        <FaHome className="text-white text-xl" />
      </div>
      <span className="text-2xl font-bold text-gray-800">Rent Safe</span>
    </div>
  )
}

export default Logo











