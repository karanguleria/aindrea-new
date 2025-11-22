import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Star, Download } from "lucide-react";
import { useAuth } from "@/contexts/userContext";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import apiService from "@/services/api";

export default function ClientProfileSetup() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedOption, setSelectedOption] = useState("download");
  const [step1Data, setStep1Data] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [formData, setFormData] = useState({
    projectTitle: "",
    tool: "",
    socialLink: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load step 1 data from localStorage
  useEffect(() => {
    const loadStep1Data = () => {
      if (typeof window !== "undefined") {
        const savedData = localStorage.getItem("clientSignupData");
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setStep1Data(parsedData);
            setIsLoading(false);
          } catch (e) {
            console.error("Error parsing localStorage data:", e);
            router.push("/client-signup");
          }
        } else {
          router.push("/client-signup");
        }
      }
    };
    loadStep1Data();
  }, [router]);

  if (isLoading) {
    return (
      <div className="w-full max-w-md space-y-4 flex items-center justify-center h-64">
        <div className="text-background">Loading...</div>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      const data = await apiService.register({
        fullName: step1Data.fullName,
        email: step1Data.email,
        password: step1Data.password,
        projectTitle: "Not specified",
        tool: "Not specified",
        socialLink: "Not specified",
      });

      if (data.status === "success") {
        await login(data.data.user, data.data.token);
        toast.success("Account created successfully!", { id: "client-signup" });
        localStorage.removeItem("clientSignupData");

        if (data.data.user.creator) {
          router.push("/creator/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(data.message || "Signup failed. Please try again.", {
          id: "client-signup",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed. Please try again.", {
        id: "client-signup",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndContinue = async () => {
    setIsSubmitting(true);
    try {
      const data = await apiService.register({
        fullName: step1Data.fullName,
        email: step1Data.email,
        password: step1Data.password,
        projectTitle: formData.projectTitle,
        tool: formData.tool,
        socialLink: formData.socialLink,
      });

      if (data.status === "success") {
        await login(data.data.user, data.data.token);
        toast.success("Account created successfully!", { id: "client-signup" });
        localStorage.removeItem("clientSignupData");

        if (data.data.user.creator) {
          router.push("/creator/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(data.message || "Signup failed. Please try again.", {
          id: "client-signup",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed. Please try again.", {
        id: "client-signup",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contentOptions = [
    { id: "rent", label: "Rent", icon: User },
    { id: "commissions", label: "Commissions", icon: Star },
    { id: "download", label: "Download", icon: Download },
  ];
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex justify-center">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-primary">
            <AvatarFallback className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-primary-foreground">
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background">
            <Download className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      </div>
      <div className="space-y-4 pt-7">
        <Input
          placeholder="Project Title"
          value={formData.projectTitle}
          onChange={(e) => handleInputChange("projectTitle", e.target.value)}
          className="text-background placeholder:text-muted-background bg-transparent"
        />

        <Input
          placeholder="Tool"
          value={formData.tool}
          onChange={(e) => handleInputChange("tool", e.target.value)}
          className="text-background placeholder:text-muted-background bg-transparent"
        />

        <Input
          placeholder="Social Link"
          value={formData.socialLink}
          onChange={(e) => handleInputChange("socialLink", e.target.value)}
          className="text-background placeholder:text-muted-background bg-transparent"
        />
      </div>
      <div className="mb-10">
        <h3 className="text-background text-lg font-medium mb-2">
          Preferred content use
        </h3>

        <div className="flex flex-wrap gap-4">
          {contentOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedOption === option.id;

            return (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`flex items-center gap-1 cursor-pointer ${
                  isSelected ? "text-primary" : "text-background"
                }`}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-primary"></div>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleSkip}
          disabled={isSubmitting}
          className="text-background cursor-pointer hover:text-neon transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Skip for now
        </button>
        <Button
          onClick={handleSaveAndContinue}
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/80 px-4 py-2 text-primary-foreground font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Account..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}
