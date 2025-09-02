import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { LoginRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);


const [credentials, setCredentials] = useState<LoginRequest>({
    email: '',
    password: ''
  });
const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      navigate('/');
    } catch (err: any) {
     console.error("Login error:", err);

  if (err.response) {
    // erreur renvoyée par le backend
    setError(err.response.data?.message || "Invalid credentials");
  } else if (err.request) {
    // erreur réseau (backend inaccessible)
    setError("Cannot connect to the server. Please try again later.");
  } else {
    setError(err.message || "An unexpected error occurred");
  }
    } finally {
      setLoading(false);
    }
  };
  return (
   <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto p-4 dark:bg-gray-900">
  <div>
    {/* --- Titre principal --- */}
    <div className="mb-6 text-center">
      <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
        Sign In
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Enter your email and password to sign in
      </p>
    </div>

    {/* --- Formulaire --- */}
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Email */}
        <div>
          <Label className="text-sm font-medium">
            Email <span className="text-error-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="info@gmail.com"
            className="h-10 text-sm"
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>

        {/* Password */}
        <div>
          <Label className="text-sm font-medium">
            Password <span className="text-error-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-10 text-sm pr-10"
              onChange={(e) =>
                setCredentials((prev) => ({ ...prev, password: e.target.value }))
              }
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

        {/* Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isChecked}
              onChange={setIsChecked}
              className="w-4 h-4"
            />
            <span className="block text-sm text-gray-700 dark:text-gray-400">
              Keep me logged in
            </span>
          </div>
          <Link
            to="/reset-password"
            className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        {/* Button */}
        <div>
          <button
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white transition rounded-lg bg-brand-500 shadow hover:bg-brand-600"
            disabled={loading}
            type="submit"
          >
            {loading ? "Connexion..." : "Sign In"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
      </div>
    </form>

    {/* Footer */}
    <div className="mt-6 text-center">
      <p className="text-sm text-gray-700 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
        >
          Sign Up
        </Link>
      </p>
    </div>
  </div>
</div>

  );
}
