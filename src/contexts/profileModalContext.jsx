"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

const ProfileModalContext = createContext();

export function ProfileModalProvider({ children }) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Check for persisted modal state on mount
  useEffect(() => {
    const isModalOpen = localStorage.getItem("profileModalOpen") === "true";
    if (isModalOpen) {
      setIsProfileModalOpen(true);
    }
  }, []);

  // Listen for custom events to open modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsProfileModalOpen(true);
    };

    window.addEventListener("openProfileModal", handleOpenModal);
    return () =>
      window.removeEventListener("openProfileModal", handleOpenModal);
  }, []);

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    localStorage.setItem("profileModalOpen", "true");
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    localStorage.removeItem("profileModalOpen");
  };

  return (
    <ProfileModalContext.Provider
      value={{
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </ProfileModalContext.Provider>
  );
}

export const useProfileModal = () => {
  const context = useContext(ProfileModalContext);
  if (!context) {
    throw new Error(
      "useProfileModal must be used within a ProfileModalProvider"
    );
  }
  return context;
};
