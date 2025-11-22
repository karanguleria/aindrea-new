import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import apiService from "@/services/api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await apiService.forgotPassword(email);

      if (data.status === "success") {
        setIsSubmitted(true);
        toast.success("Password reset link sent to your email!", { id: "forgot-password" });
      } else {
        setError(data.message || "Failed to send reset email", { id: "forgot-password" });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError(
        error.message || "Failed to send reset email. Please try again.",
        { id: "forgot-password" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-background text-2xl lg:text-3xl font-bold mb-4">
          Check your email
        </h2>

        <p className="text-background/80 mb-6">
          We've sent a password reset link to <strong>{email}</strong>
        </p>

        <p className="text-sm text-background/60 mb-6">
          Didn't receive the email? Check your spam folder or try again.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => {
              setIsSubmitted(false);
              setEmail("");
            }}
            variant="outline"
            className="w-full border-border text-background bg-transparent"
          >
            Try again with different email
          </Button>

          <Link href="/" className="block">
            <Button
              variant="link"
              className="w-full text-neon hover:text-neon/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
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
          Forgot your password?
        </h2>
        <p className="text-background/80">
          No worries! Enter your email and we'll send you a reset link.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="text-background placeholder:text-muted-background bg-transparent"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>

      <div className="text-center">
        <Link href="/">
          <Button
            variant="link"
            className="text-primary hover:text-primary/80 p-0 h-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Button>
        </Link>
      </div>
    </form>
  );
}
