import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Camera, Video, Music, Layers, Download } from "lucide-react";
import { useAuth } from "@/contexts/userContext";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import apiService from "@/services/api";

export default function CreatorProfileSetup() {
  const router = useRouter();
  const { login } = useAuth();
  const [step1Data, setStep1Data] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [formData, setFormData] = useState({
    jobTitle: "",
    location: "",
    socialLink: "",
  });
  const [primaryDiscipline, setPrimaryDiscipline] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load step 1 data from localStorage
  useEffect(() => {
    const loadStep1Data = () => {
      if (typeof window !== "undefined") {
        const savedData = localStorage.getItem("creatorSignupData");
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setStep1Data(parsedData);
            setIsLoading(false);
          } catch (e) {
            console.error("Error parsing localStorage data:", e);
            router.push("/creator-signup");
          }
        } else {
          router.push("/creator-signup");
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

  const handleDisciplineChange = (discipline, event) => {
    const checked = event.target.checked;
    if (checked) {
      setPrimaryDiscipline((prev) => [...prev, discipline]);
    } else {
      setPrimaryDiscipline((prev) => prev.filter((d) => d !== discipline));
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      const data = await apiService.register({
        fullName: step1Data.fullName,
        email: step1Data.email,
        password: step1Data.password,
        jobTitle: "Not specified",
        primaryDiscipline: ["General"],
        location: "Not specified",
        socialLink: "Not specified",
      });

      if (data.status === "success") {
        await login(data.data.user, data.data.token);
        toast.success("Account created successfully!", { id: "creator-signup" });
        localStorage.removeItem("creatorSignupData");

        if (data.data.user.creator) {
          router.push("/creator/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(data.message || "Signup failed. Please try again.", {
          id: "creator-signup",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed. Please try again.", {
        id: "creator-signup",
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
        jobTitle: formData.jobTitle,
        primaryDiscipline: primaryDiscipline,
        location: formData.location,
        socialLink: formData.socialLink,
      });

      if (data.status === "success") {
        await login(data.data.user, data.data.token);
        toast.success("Account created successfully!", { id: "creator-signup" });
        localStorage.removeItem("creatorSignupData");

        if (data.data.user.creator) {
          router.push("/creator/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(data.message || "Signup failed. Please try again.", {
          id: "creator-signup",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed. Please try again.", {
        id: "creator-signup",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disciplineOptions = [
    { id: "UI/UX", label: "UI/UX", icon: Camera },
    { id: "Prototyping", label: "Prototyping", icon: Video },
    { id: "Animation", label: "Animation", icon: Music },
    { id: "Branding", label: "Branding", icon: Layers },
  ];
  return (
    <div className="w-full max-w-md space-y-4 border-none">
      <div className="p-6 space-y-6">
        {/* Avatar Section */}
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

        {/* Form Fields */}
        <div className="space-y-3">
          {/* Job Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-background">
              Job Title<span className="text-destructive ml-1">*</span>
            </label>
            <Input
              placeholder="Enter your job title"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              className="w-full mt-1 text-background placeholder:text-muted-background bg-transparent"
            />
          </div>

          {/* Primary Discipline */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-background">
              Primary Discipline<span className="text-destructive ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {disciplineOptions.map((option) => {
                const IconComponent = option.icon;
                const isChecked = primaryDiscipline.includes(option.id);

                return (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={isChecked}
                      onChange={(event) =>
                        handleDisciplineChange(option.id, event)
                      }
                    />
                    <label
                      htmlFor={option.id}
                      className="flex items-center space-x-2 text-sm font-medium text-background cursor-pointer"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{option.label}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-background">
              Location
            </label>
            <Input
              placeholder="Enter your location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full mt-1 text-background placeholder:text-muted-background bg-transparent"
            />
          </div>

          {/* Social Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-background">
              Social Link
            </label>
            <Input
              placeholder="Enter your social link"
              value={formData.socialLink}
              onChange={(e) => handleInputChange("socialLink", e.target.value)}
              className="w-full mt-1 text-background placeholder:text-muted-background bg-transparent"
            />
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
    </div>
  );
}
