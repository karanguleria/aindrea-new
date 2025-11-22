import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import apiService from "@/services/api";

export default function ResetPasswordForm() {
  const router = useRouter();
  const { token } = router.query;

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [tokenError, setTokenError] = useState("");

  useEffect(() => {
    // Check if token is present in URL
    if (router.isReady && !token) {
      setTokenError("Invalid or missing reset token");
    }
  }, [router.isReady, token]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user types
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = {};

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors[0];
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!token) {
      toast.error("Invalid reset token", { id: "reset-password" });
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiService.resetPassword(token, formData.password);

      if (data.status === "success") {
        setIsSuccess(true);
        toast.success("Password reset successfully!", { id: "reset-password" });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setErrors({ general: data.message || "Failed to reset password" });
        toast.error(data.message || "Failed to reset password", { id: "reset-password" });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage =
        error.message || "Failed to reset password. Please try again.";
      setErrors({ general: errorMessage });

      // Check if token is expired or invalid
      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("invalid")
      ) {
        setTokenError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-background text-2xl lg:text-3xl font-bold mb-4">
          Password Reset Successful!
        </h2>

        <p className="text-background/80 mb-6">
          Your password has been successfully reset. You can now log in with
          your new password.
        </p>

        <p className="text-sm text-background/60 mb-6">
          Redirecting you to the login page...
        </p>

        <Link href="/" className="block">
          <Button className="w-full bg-primary text-white hover:bg-primary/90">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  // Token error state
  if (tokenError) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-destructive" />
        </div>

        <h2 className="text-background text-2xl lg:text-3xl font-bold mb-4">
          Invalid or Expired Link
        </h2>

        <p className="text-background/80 mb-6">
          {tokenError ||
            "This password reset link is invalid or has expired. Please request a new one."}
        </p>

        <div className="space-y-3">
          <Link href="/forgot-password" className="block">
            <Button className="w-full bg-primary text-white hover:bg-primary/90">
              Request New Reset Link
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button
              variant="outline"
              className="w-full border-border text-background bg-transparent"
            >
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-background text-2xl lg:text-3xl font-bold mb-2">
          Reset Your Password
        </h2>
        <p className="text-background/80">
          Enter your new password below to reset it.
        </p>
      </div>

      {errors.general && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-destructive text-sm">{errors.general}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-background text-sm font-medium mb-2 block">
            New Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="text-background pr-10 placeholder:text-muted-background bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-background/60 hover:text-background"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="text-background text-sm font-medium mb-2 block">
            Confirm New Password
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              className="text-background pr-10 placeholder:text-muted-background bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-background/60 hover:text-background"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
        <p className="text-background text-sm font-medium mb-2">
          Password Requirements:
        </p>
        <ul className="text-background/70 text-xs space-y-1">
          <li className="flex items-center gap-2">
            <span
              className={
                formData.password.length >= 6
                  ? "text-primary"
                  : "text-background/50"
              }
            >
              {formData.password.length >= 6 ? "✓" : "○"}
            </span>
            At least 6 characters
          </li>
          <li className="flex items-center gap-2">
            <span
              className={
                /[A-Z]/.test(formData.password)
                  ? "text-primary"
                  : "text-background/50"
              }
            >
              {/[A-Z]/.test(formData.password) ? "✓" : "○"}
            </span>
            One uppercase letter
          </li>
          <li className="flex items-center gap-2">
            <span
              className={
                /[a-z]/.test(formData.password)
                  ? "text-primary"
                  : "text-background/50"
              }
            >
              {/[a-z]/.test(formData.password) ? "✓" : "○"}
            </span>
            One lowercase letter
          </li>
          <li className="flex items-center gap-2">
            <span
              className={
                /[0-9]/.test(formData.password)
                  ? "text-primary"
                  : "text-background/50"
              }
            >
              {/[0-9]/.test(formData.password) ? "✓" : "○"}
            </span>
            One number
          </li>
        </ul>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Resetting Password..." : "Reset Password"}
      </Button>

      <div className="text-center">
        <Link
          href="/"
          className="text-background hover:text-neon text-sm font-normal transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </form>
  );
}

