import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { ForgotPasswordRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const { forgotPassword, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const data: ForgotPasswordRequest = {
        email,
        new_password: password
      };
      
      await forgotPassword(data);
      setSuccess(true);

      setTimeout(() => {
        navigate('/signin');
      }, 2000);
      
    } catch (error: any) {
      setError(error?.message || "An error occurred while resetting password");
    }
  };

  if (success) {
    return (
      <div className="flex flex-col w-full h-screen justify-center mx-auto max-w-md p-4 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 rounded-lg text-sm">
            <h2 className="text-lg font-semibold mb-1">Password Reset Successful!</h2>
            <p>Your password has been reset successfully. You will be redirected to the sign-in page.</p>
          </div>
          <Link
            to="/signin"
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium text-sm"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen justify-center mx-auto max-w-md p-4 dark:bg-gray-900">
      {/* --- Titre --- */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
          Reset Password
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email and choose a new password
        </p>
      </div>

      {/* --- Message d'erreur --- */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* --- Formulaire --- */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Email */}
          <div>
            <Label className="text-sm font-medium">
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 text-sm"
              disabled={isLoading}
              
            />
          </div>

          {/* Password */}
          <div>
            <Label className="text-sm font-medium">
              New Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                placeholder="Enter your new password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 text-sm pr-10"
                disabled={isLoading}
                
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-3 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
          </div>

          {/* Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white transition rounded-lg bg-brand-500 shadow hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </div>
      </form>

      {/* --- Footer --- */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-700 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
