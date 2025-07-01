import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addToast, ToastProvider } from "@heroui/toast";
import authService from "../../services/authService";
import { Button, Input } from "@heroui/react";

export const EyeSlashFilledIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M21.2714 9.17834C20.9814 8.71834 20.6714 8.28834 20.3514 7.88834C19.9814 7.41834 19.2814 7.37834 18.8614 7.79834L15.8614 10.7983C16.0814 11.4583 16.1214 12.2183 15.9214 13.0083C15.5714 14.4183 14.4314 15.5583 13.0214 15.9083C12.2314 16.1083 11.4714 16.0683 10.8114 15.8483C10.8114 15.8483 9.38141 17.2783 8.35141 18.3083C7.85141 18.8083 8.01141 19.6883 8.68141 19.9483C9.75141 20.3583 10.8614 20.5683 12.0014 20.5683C13.7814 20.5683 15.5114 20.0483 17.0914 19.0783C18.7014 18.0783 20.1514 16.6083 21.3214 14.7383C22.2714 13.2283 22.2214 10.6883 21.2714 9.17834Z"
        fill="currentColor"
      />
      <path
        d="M14.0206 9.98062L9.98062 14.0206C9.47062 13.5006 9.14062 12.7806 9.14062 12.0006C9.14062 10.4306 10.4206 9.14062 12.0006 9.14062C12.7806 9.14062 13.5006 9.47062 14.0206 9.98062Z"
        fill="currentColor"
      />
      <path
        d="M18.25 5.74969L14.86 9.13969C14.13 8.39969 13.12 7.95969 12 7.95969C9.76 7.95969 7.96 9.76969 7.96 11.9997C7.96 13.1197 8.41 14.1297 9.14 14.8597L5.76 18.2497H5.75C4.64 17.3497 3.62 16.1997 2.75 14.8397C1.75 13.2697 1.75 10.7197 2.75 9.14969C3.91 7.32969 5.33 5.89969 6.91 4.91969C8.49 3.95969 10.22 3.42969 12 3.42969C14.23 3.42969 16.39 4.24969 18.25 5.74969Z"
        fill="currentColor"
      />
      <path
        d="M14.8581 11.9981C14.8581 13.5681 13.5781 14.8581 11.9981 14.8581C11.9381 14.8581 11.8881 14.8581 11.8281 14.8381L14.8381 11.8281C14.8581 11.8881 14.8581 11.9381 14.8581 11.9981Z"
        fill="currentColor"
      />
      <path
        d="M21.7689 2.22891C21.4689 1.92891 20.9789 1.92891 20.6789 2.22891L2.22891 20.6889C1.92891 20.9889 1.92891 21.4789 2.22891 21.7789C2.37891 21.9189 2.56891 21.9989 2.76891 21.9989C2.96891 21.9989 3.15891 21.9189 3.30891 21.7689L21.7689 3.30891C22.0789 3.00891 22.0789 2.52891 21.7689 2.22891Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const EyeFilledIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M21.25 9.14969C18.94 5.51969 15.56 3.42969 12 3.42969C10.22 3.42969 8.49 3.94969 6.91 4.91969C5.33 5.89969 3.91 7.32969 2.75 9.14969C1.75 10.7197 1.75 13.2697 2.75 14.8397C5.06 18.4797 8.44 20.5597 12 20.5597C13.78 20.5597 15.51 20.0397 17.09 19.0697C18.67 18.0897 20.09 16.6597 21.25 14.8397C22.25 13.2797 22.25 10.7197 21.25 9.14969ZM12 16.0397C9.76 16.0397 7.96 14.2297 7.96 11.9997C7.96 9.76969 9.76 7.95969 12 7.95969C14.24 7.95969 16.04 9.76969 16.04 11.9997C16.04 14.2297 14.24 16.0397 12 16.0397Z"
        fill="currentColor"
      />
      <path
        d="M11.9984 9.14062C10.4284 9.14062 9.14844 10.4206 9.14844 12.0006C9.14844 13.5706 10.4284 14.8506 11.9984 14.8506C13.5684 14.8506 14.8584 13.5706 14.8584 12.0006C14.8584 10.4306 13.5684 9.14062 11.9984 9.14062Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const token = searchParams.get("token");
  const errors = [];
  const [isVisibleNewPassword, setIsVisibleNewPassword] = useState(false);
  const [isVisibleConfirmPassword, setIsVisibleConfirmPassword] =
    useState(false);

  if (password.length < 8) {
    errors.push("Password must be 8 characters or more.");
  }
  if ((password.match(/[A-Z]/g) || []).length < 1) {
    errors.push("Password must include at least 1 upper case letter");
  }
  if ((password.match(/[^a-z0-9]/gi) || []).length < 1) {
    errors.push("Password must include at least 1 symbol.");
  }

  console.log("errors", errors);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        addToast({
          color: "danger",
          description: "Invalid or missing reset token",
        });
        navigate("/forgot-password");
        return;
      }

      try {
        setIsLoading(true);
        const response = await authService.validateResetToken(token);
        console.log("response", response);
        if (response.valid) {
          setIsValidToken(true);
        } else {
          addToast({
            color: "danger",
            description: "Invalid or expired reset token",
          });
          navigate("/forgot-password");
        }
      } catch (error) {
        console.error("Error validating token:", error);
        addToast({
          color: "danger",
          description: "Invalid or expired reset token",
        });
        navigate("/forgot-password");
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast({
        color: "danger",
        description: "Passwords do not match",
      });
      return;
    }

    try {
      setIsResetting(true);
      await authService.resetPassword(token, password);
      addToast({
        color: "success",
        description: "Your password has been reset successfully",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      addToast({
        color: "danger",
        description:
          error.response?.data?.message || "Failed to reset password",
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="text-red-500">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
            Invalid or Expired Link
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            The password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastProvider placement="bottom-center" toastOffset={0} />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Reset Your Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please enter your new password below.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <Input
                errorMessage={() => (
                  <ul>
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                )}
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={() =>
                      setIsVisibleNewPassword(!isVisibleNewPassword)
                    }
                  >
                    {isVisibleNewPassword ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                isInvalid={errors.length > 0}
                label="New Password"
                labelPlacement="outside"
                name="password"
                type={isVisibleNewPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onValueChange={setPassword}
              />

              <Input
                label="Confirm New Password"
                endContent={
                  <button
                    aria-label="toggle password visibility"
                    className="focus:outline-none"
                    type="button"
                    onClick={() =>
                      setIsVisibleConfirmPassword(!isVisibleConfirmPassword)
                    }
                  >
                    {isVisibleConfirmPassword ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                placeholder="Confirm your new password"
                type={isVisibleConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword}
              />
            </div>

            <div>
              <Button
                color="primary"
                className="w-full"
                type="submit"
                disabled={isResetting}
              >
                {isResetting ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
