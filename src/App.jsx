import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import ForgotPassword from '@/pages/ForgotPassword'
import OtpVerification from '@/pages/OtpVerification'
import CreatePassword from '@/pages/CreatePassword'
import PasswordSuccess from '@/pages/PasswordSuccess'
import RoleSelection from '@/pages/RoleSelection'
import OwnerBasicInfo from '@/pages/owner/BasicInformation'
import OwnerVerifyAccount from '@/pages/owner/VerifyAccount'
import OwnerSignupSuccess from '@/pages/owner/SignupSuccess'
import RenterBasicInfo from '@/pages/renter/BasicInformation'
import RenterShareThoughts from '@/pages/renter/ShareThoughts'
import RenterSignupSuccess from '@/pages/renter/SignupSuccess'
import Dashboard from '@/pages/Dashboard'
import TenantProfile from '@/pages/TenantProfile'
import RentalHistory from '@/pages/RentalHistory'
import Messages from '@/pages/Messages'
import MyProperties from '@/pages/MyProperties'
import PropertyDetail from '@/pages/PropertyDetail'
import AddProperty from '@/pages/AddProperty'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verification" element={<OtpVerification />} />
      <Route path="/create-password" element={<CreatePassword />} />
      <Route path="/password-success" element={<PasswordSuccess />} />
      
      {/* Signup Flow */}
      <Route path="/signup" element={<RoleSelection />} />
      
      {/* Owner Signup Flow */}
      <Route path="/signup/owner/basic-info" element={<OwnerBasicInfo />} />
      <Route path="/signup/owner/verify-account" element={<OwnerVerifyAccount />} />
      <Route path="/signup/owner/success" element={<OwnerSignupSuccess />} />
      
      {/* Renter Signup Flow */}
      <Route path="/signup/renter/basic-info" element={<RenterBasicInfo />} />
      <Route path="/signup/renter/share-thoughts" element={<RenterShareThoughts />} />
      <Route path="/signup/renter/success" element={<RenterSignupSuccess />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/properties" element={<MyProperties />} />
      <Route path="/dashboard/properties/add" element={<AddProperty />} />
      <Route path="/dashboard/properties/:id" element={<PropertyDetail />} />
      <Route path="/dashboard/messages" element={<Messages />} />
      <Route path="/dashboard/tenant/:id" element={<TenantProfile />} />
      <Route path="/dashboard/tenant/:id/rental-history" element={<RentalHistory />} />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
