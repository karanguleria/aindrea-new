"use client";

import React, { createContext, useContext, useState } from "react";

const PreviewModalContext = createContext(undefined);

export function PreviewModalProvider({ children }) {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [onSelectVariantCallback, setOnSelectVariantCallback] = useState(null);

  const openPreviewModal = (image, onSelectVariant = null) => {
    setPreviewImage(image);
    setOnSelectVariantCallback(() => onSelectVariant);
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewImage(null);
    setOnSelectVariantCallback(null);
  };

  return (
    <PreviewModalContext.Provider
      value={{
        isPreviewModalOpen,
        previewImage,
        openPreviewModal,
        closePreviewModal,
        onSelectVariantCallback,
      }}
    >
      {children}
    </PreviewModalContext.Provider>
  );
}

export function usePreviewModal() {
  const context = useContext(PreviewModalContext);
  if (context === undefined) {
    throw new Error(
      "usePreviewModal must be used within a PreviewModalProvider"
    );
  }
  return context;
}
