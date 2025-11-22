"use client";

import React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProfileDetailsTab({
  profileData,
  handleProfileChange,
  handleDisciplineChange,
  handleProfileSubmit,
  isLoading,
  user,
}) {
  // Creator discipline options (from CreatorProfileSetup)
  const creatorDisciplineOptions = [
    { id: "UI/UX", label: "UI/UX" },
    { id: "Prototyping", label: "Prototyping" },
    { id: "Animation", label: "Animation" },
    { id: "Branding", label: "Branding" },
  ];

  return (
    <div className="space-y-3 h-full">
      <div>
        <h3 className="text-base font-medium mb-0">Profile Details</h3>
        <p className="text-xs text-muted-foreground">
          Update your profile information and preferences
        </p>
      </div>
      <hr className="my-2 border-border" />
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="socialLink" className="text-xs">
            Social Link
          </Label>
          <Input
            id="socialLink"
            value={profileData.socialLink}
            onChange={(e) => handleProfileChange("socialLink", e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className="text-sm"
          />
        </div>

        {/* Creator-specific fields */}
        {user?.creator && (
          <>
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-xs">
                Job Title
              </Label>
              <Input
                id="jobTitle"
                value={profileData.jobTitle}
                onChange={(e) =>
                  handleProfileChange("jobTitle", e.target.value)
                }
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs">
                Location
              </Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) =>
                  handleProfileChange("location", e.target.value)
                }
                className="text-sm"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs">Primary Disciplines</Label>
              <div className="grid grid-cols-2 gap-3">
                {creatorDisciplineOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={profileData.primaryDiscipline.includes(
                        option.id
                      )}
                      onChange={() => handleDisciplineChange(option.id)}
                    />
                    <label
                      htmlFor={option.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Client-specific fields */}
        {user?.client && (
          <>
            <div className="space-y-2">
              <Label htmlFor="tool" className="text-xs">
                Preferred Tool
              </Label>
              <Input
                id="tool"
                value={profileData.tool}
                onChange={(e) => handleProfileChange("tool", e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectTitle" className="text-xs">
                Project Title
              </Label>
              <Input
                id="projectTitle"
                value={profileData.projectTitle}
                onChange={(e) =>
                  handleProfileChange("projectTitle", e.target.value)
                }
                className="text-sm"
              />
            </div>
          </>
        )}
      </form>
    </div>
  );
}
