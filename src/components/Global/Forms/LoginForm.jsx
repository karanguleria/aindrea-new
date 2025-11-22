import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Chrome,
  Apple,
  Facebook,
  ArrowBigRight,
  ArrowBigDown,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/userContext";
import toast from "react-hot-toast";
import apiService from "@/services/api";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        const data = await apiService.login(formData.email, formData.password);

        if (data.status === "success") {
          await login(data.data.user, data.data.token);
          toast.success("Login successful! Welcome back!", { id: "login" });

          // Redirect based on user role
          if (data.data.user.creator) {
            router.push("/creator/dashboard");
          } else {
            router.push("/dashboard");
          }
        } else {
          toast.error(
            data.message || "Login failed. Please check your credentials.",
            { id: "login" }
          );
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error(error.message || "Login failed. Please try again.", {
          id: "login",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <h2 className="text-background text-2xl lg:text-3xl font-bold mb-8">
        Log in to your Account
      </h2>

      <div className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="text-background placeholder:text-muted-background bg-transparent"
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

        <div className="w-full flex justify-end">
          <Link
            href="/forgot-password"
            className="text-background hover:text-neon text-sm font-normal transition-colors"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Logging in..." : "Log in"}
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
        <span className="text-background/80">New Here? </span>
        <Button variant="link" className="text-background p-0 h-auto ">
          Create an AINDREA account{" "}
          <ArrowBigDown className="w-4 h-4 text-neon" />
        </Button>
      </div>

      <div className="flex space-x-3 mt-5">
        <Link href="/client-signup" className="flex-1">
          <Button
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground border-border rounded-md flex items-center justify-center px-4 py-4
                     transition-transform duration-300 ease-in-out hover:scale-105"
          >
            <span className="font-medium">Signup as Client</span>
          </Button>
        </Link>

        <Link href="/creator-signup" className="flex-1">
          <Button
            className="w-full bg-[#00FFF7] hover:bg-[#00FFF7]/80 border-border text-black rounded-md flex items-center justify-center px-4 py-4
                     transition-transform duration-300 ease-in-out hover:scale-105"
          >
            <span className="font-medium">Signup as Creator</span>
          </Button>
        </Link>
      </div>
    </form>
  );
}
