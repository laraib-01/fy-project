import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { addToast, ToastProvider } from "@heroui/toast";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      addToast({
        color: "danger",
        description: "Please enter your email address",
      });
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      addToast({
        color: "success",
        description:
          "If an account with that email exists, a password reset link has been sent",
      });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      console.error(
        error.response?.data?.message || "Failed to process your request"
      );
      addToast({
        color: "danger",
        description:
          error.response?.data?.message || "Failed to process your request",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastProvider placement="bottom-center" toastOffset={0} />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isSubmitted ? "Check Your Email" : "Forgot Your Password?"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isSubmitted ? (
                "We have sent a password reset link to your email address."
              ) : (
                <>
                  Enter your email address and we'll send you a link to reset
                  your password.
                  <br />
                  <Link
                    to="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Back to sign in
                  </Link>
                </>
              )}
            </p>
          </div>

          {!isSubmitted ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                    isLoading
                      ? "bg-indigo-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <button
                onClick={() => navigate("/login")}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
