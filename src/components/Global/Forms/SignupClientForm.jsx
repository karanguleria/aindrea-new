import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Chrome,
  Apple,
  Facebook,
  ArrowBigRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function SignupClientForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Store step 1 data in localStorage
      localStorage.setItem(
        "clientSignupData",
        JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        })
      );
      // Navigate to step 2
      router.push("/client-profile-setup");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <h2 className="text-background text-2xl lg:text-3xl font-bold mb-8">
        Create your Account
      </h2>

      <div className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Full name"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className={`text-background placeholder:text-muted-background bg-transparent ${
              errors.fullName ? "border-red-500" : ""
            }`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <Input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`text-background placeholder:text-muted-background bg-transparent ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`text-background pr-10 placeholder:text-muted-background bg-transparent ${
                errors.password ? "border-red-500" : ""
              }`}
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
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              className={`text-background pr-10 placeholder:text-muted-background bg-transparent ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
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

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-medium rounded-md"
      >
        Sign up
      </Button>
      <div className="flex items-center space-x-4">
        <div className="flex-1 h-px bg-primary"></div>
        <span className="text-muted-foreground text-sm">or</span>
        <div className="flex-1 h-px bg-primary"></div>
      </div>
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full border-border text-background rounded-lg flex items-center justify-between px-4 bg-transparent
               transition-transform duration-300 ease-in-out hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <Chrome className="w-5 h-5 text-neon" />
            <span className="text-background">Continue with Google</span>
          </div>
          <ArrowBigRight className="text-neon fill-neon" />
        </Button>

        <Button
          variant="outline"
          className="w-full border-border text-background rounded-lg flex items-center justify-between px-4 bg-transparent
               transition-transform duration-300 ease-in-out hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <Apple className="w-5 h-5 text-neon" />
            <span className="text-background">Continue with Apple</span>
          </div>
          <ArrowBigRight className="text-neon fill-neon" />
        </Button>

        <Button
          variant="outline"
          className="w-full border-border text-background rounded-lg flex items-center justify-between px-4 bg-transparent
               transition-transform duration-300 ease-in-out hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <Facebook className="w-5 h-5 text-neon" />
            <span className="text-background">Continue with Facebook</span>
          </div>
          <ArrowBigRight className="text-neon fill-neon" />
        </Button>
      </div>
      <div className="text-center mt-5">
        <span className="text-background">Already have an account? </span>
        <Link href="/">
          <Button
            variant="link"
            className="text-neon hover:text-neon/80 p-0 h-auto "
          >
            Log in to AINDREA
          </Button>
        </Link>
      </div>
    </form>
  );
}
