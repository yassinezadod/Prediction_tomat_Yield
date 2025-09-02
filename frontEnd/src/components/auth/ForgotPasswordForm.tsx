import { useState } from "react";
import { Link } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col flex-1 w-full max-w-xl mx-auto p-6 dark:bg-gray-900">
      {/* --- Titre --- */}
      <div className="mb-8 text-center">
        <h1 className="mb-3 font-bold text-gray-900 dark:text-white text-4xl">
          Forgot Password
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Enter your email and we’ll send you a link to reset your password
        </p>
      </div>

      {/* --- Formulaire --- */}
      <form>
        <div className="space-y-6">
          {/* Email */}
          <div>
            <Label className="text-lg font-medium">
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-lg"
            />
          </div>

          {/* Bouton */}
          <div>
            <button
              type="submit"
              className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white transition rounded-2xl bg-brand-500 shadow-lg hover:bg-brand-600"
            >
              Send Reset Link
            </button>
          </div>
        </div>
      </form>

      {/* --- Footer --- */}
      <div className="mt-8 text-center">
        <p className="text-base text-gray-700 dark:text-gray-400">
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
