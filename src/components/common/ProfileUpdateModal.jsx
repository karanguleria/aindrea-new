"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/userContext";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { BaseModal } from "@/components/ui/base-modal";
import BasicInfoTab from "./ProfileModal/BasicInfoTab";
import ProfileDetailsTab from "./ProfileModal/ProfileDetailsTab";
import PasswordTab from "./ProfileModal/PasswordTab";
import ProfileModalSidebar from "./ProfileModal/ProfileModalSidebar";

export default function ProfileUpdateModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Basic info form state (username, email)
  const [basicData, setBasicData] = useState({
    fullName: "",
    email: "",
  });

  // Profile details form state (from signup forms)
  const [profileData, setProfileData] = useState({
    socialLink: "",
    // Creator fields
    jobTitle: "",
    primaryDiscipline: [],
    location: "",
    // Client fields
    tool: "",
    projectTitle: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setBasicData({
        fullName: user.fullName || "",
        email: user.email || "",
      });
      setProfileData({
        socialLink: user.socialLink || "",
        jobTitle: user.jobTitle || "",
        primaryDiscipline: user.primaryDiscipline || [],
        location: user.location || "",
        tool: user.tool || "",
        projectTitle: user.projectTitle || "",
      });
    }
  }, [user]);

  const handleBasicChange = (field, value) => {
    setBasicData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDisciplineChange = (discipline) => {
    setProfileData((prev) => ({
      ...prev,
      primaryDiscipline: prev.primaryDiscipline.includes(discipline)
        ? prev.primaryDiscipline.filter((d) => d !== discipline)
        : [...prev.primaryDiscipline, discipline],
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.updateUser(basicData);
      console.log("Basic update response:", response); // Debug log

      // If we get here without an error, the update was successful
      // Update the user context with the new data
      updateUser({ ...user, ...basicData });
      toast.success("Basic information updated successfully!", {
        id: "basic-info",
      });
      // Don't close modal, let user continue editing
    } catch (error) {
      console.error("Error updating basic info:", error);
      toast.error("Failed to update basic information. Please try again.", {
        id: "basic-info",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.updateUser(profileData);
      console.log("Profile update response:", response); // Debug log

      // If we get here without an error, the update was successful
      // Update the user context with the new data
      updateUser({ ...user, ...profileData });
      toast.success("Profile details updated successfully!", {
        id: "profile-details",
      });
      // Don't close modal, let user continue editing
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile details. Please try again.", {
        id: "profile-details",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match", { id: "password-update" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters", {
        id: "password-update",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.updateUser({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      console.log("Password update response:", response); // Debug log

      // If we get here without an error, the update was successful
      toast.success("Password updated successfully!", {
        id: "password-update",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // Don't close modal, let user continue editing
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(
        "Failed to update password. Please check your current password.",
        { id: "password-update" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (activeTab === "basic") {
      handleBasicSubmit(e);
    } else if (activeTab === "profile") {
      handleProfileSubmit(e);
    } else if (activeTab === "password") {
      handlePasswordSubmit(e);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      maxWidth="max-w-4xl"
      height="h-[650px]"
      fixedHeight={true}
      noPadding={true}
      footer={
        <>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </>
      }
    >
      {/* Content Area with Sidebar */}
      <div className="flex h-full overflow-hidden">
        {/* Sidebar */}
        <ProfileModalSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 h-full">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <BasicInfoTab
                basicData={basicData}
                handleBasicChange={handleBasicChange}
                handleBasicSubmit={handleBasicSubmit}
                isLoading={isLoading}
              />
            )}

            {/* Profile Details Tab */}
            {activeTab === "profile" && (
              <ProfileDetailsTab
                profileData={profileData}
                handleProfileChange={handleProfileChange}
                handleDisciplineChange={handleDisciplineChange}
                handleProfileSubmit={handleProfileSubmit}
                isLoading={isLoading}
                user={user}
              />
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <PasswordTab
                passwordData={passwordData}
                handlePasswordChange={handlePasswordChange}
                handlePasswordSubmit={handlePasswordSubmit}
                isLoading={isLoading}
                showCurrentPassword={showCurrentPassword}
                setShowCurrentPassword={setShowCurrentPassword}
                showNewPassword={showNewPassword}
                setShowNewPassword={setShowNewPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
              />
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
