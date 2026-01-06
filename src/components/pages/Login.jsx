'use client'

import { useEffect, useState } from "react";
import { Link } from '@/lib/react-router-compat';
import AuthLayout from "@/components/AuthLayout";
import CustomCheckbox from "@/components/adminDashboard/common/CustomCheckbox";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Show a one-time toast if we were redirected here due to account deactivation/inactive status
  useEffect(() => {
    try {
      const msg = sessionStorage.getItem('authRedirectToast');
      if (msg) {
        sessionStorage.removeItem('authRedirectToast');
        toast.error(msg);
      }
    } catch (_) {
      // no-op
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    setLoginError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      // Redirect is handled by AuthContext
    } catch (error) {
      const errorMessage = error.message || "Login failed. Please check your credentials.";
      setLoginError(errorMessage);
      
      // Show toast notification
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="block">
        {/* Logo */}
        <div className="mb-6">
          <img src="/images/dashboard/mainLogo.png" alt="Logo" className="justify-center" />
        </div>

        {/* Welcome Message */}
        <div className="text-left mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] lg:leading-[45px] font-bold text-secondary mb-2">
            Welcome Back
          </h1>
          <p className="text-darkGray text-base md:text-lg font-normal">
            Log in to continue your Rent Safe experience.
          </p>
        </div>

        {/* Login Form */}
        <form noValidate onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-base font-semibold text-secondary mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your registered email address"
              className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 ${
                errors.email ? "border-errorColor " : "border-lightGray "
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-errorColor">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div>
              <label
                htmlFor="password"
                className="block text-base font-semibold text-secondary mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 border h-[52px] rounded-xl text-base font-normal text-secondary focus:outline-none focus:ring-0 pr-12 ${
                    errors.password ? "border-errorColor" : "border-lightGray"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary"
                >
                  {showPassword ? (
                    <BsEye className="text-xl" />
                  ) : (
                    <BsEyeSlash className="text-xl" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mt-2">
              <CustomCheckbox
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                label="Remember me"
              />
              <Link
                to="/forgot-password"
                className="text-sm text-primary font-semibold"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blueGradient h-[56px] text-white text-base font-bold py-3 rounded-xl transition-all shadow-[0px_2px_10px_0px_#00000033] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Create Account Link */}
        <div className="mt-2 text-left">
          <span className="text-base font-normal text-darkGray">
            Don't have an account?{" "}
          </span>
          <Link to="/signup" className="text-primary text-base font-bold">
            Create an account
          </Link>
        </div>

        {/* Terms and Privacy */}
        <div className="mt-6 text-sm font-normal text-darkGray">
          By logging in, you agreed to our{" "}
          <Link to="/terms" className="text-primary text-sm font-bold">
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-primary text-sm font-bold">
            Privacy Policy
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Login;
