import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { RegisterRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {  Phone,UserIcon} from "../../icons";


export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone:'',
    bio:''
  });

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    if (!isChecked) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Prepare data for API
      const registerData: RegisterRequest = {
        name: `${formData.firstName}  ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        firstname: formData.firstName,
        lastname: formData.lastName,
        phone:formData.phone,
        bio:formData.bio,
      };

      await register(registerData);
      
      // Success - redirect to sign in or dashboard
      navigate('/signin');
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
 <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar dark:bg-gray-900">
  <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto p-4">
    <div>
      {/* --- Titre principal --- */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 font-bold text-gray-900 dark:text-white text-2xl">
          Sign Up
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email and password to create your account
        </p>
      </div>

      {/* --- Formulaire --- */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {/* First & Last Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">
                First Name<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                className="h-10 text-base"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">
                Last Name<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                className="h-10 text-base"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Bio */}

          <div>
            <Label className="text-sm font-medium">
              Bio<span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter your Bio"
                className="h-10 text-base pl-12"
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <UserIcon className="size-5" />
              </span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label className="text-sm font-medium">
              Phone<span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="tel"
                placeholder="0666666666"
                className="h-10 text-base pl-12"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <Phone className="size-5" />
              </span>
            </div>
          </div>
          </div>

          {/* Email */}
          <div>
            <Label className="text-sm font-medium">
              Email<span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="h-10 text-base"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <Label className="text-sm font-medium">
              Password<span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="h-10 text-base pr-10"
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

          {/* Checkbox */}
          <div className="flex items-start gap-2">
            <Checkbox
              className="w-5 h-5 mt-0.5"
              checked={isChecked}
              onChange={setIsChecked}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              By creating an account you agree to the{" "}
              <span className="text-gray-900 dark:text-white font-medium">
                Terms and Conditions
              </span>{" "}
              and our{" "}
              <span className="text-gray-900 dark:text-white font-medium">
                Privacy Policy
              </span>
            </p>
          </div>

          {/* Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full px-4 py-2 text-base font-semibold text-white transition rounded-xl bg-brand-500 shadow hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Footer */}
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
  </div>
</div>

  );
}
