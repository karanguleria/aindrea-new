"use client";

import React, { createContext, useContext, useState } from "react";

const BillingModalContext = createContext(undefined);

export function BillingModalProvider({ children }) {
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  const openBillingModal = () => {
    setIsBillingModalOpen(true);
  };

  const closeBillingModal = () => {
    setIsBillingModalOpen(false);
  };

  return (
    <BillingModalContext.Provider
      value={{
        isBillingModalOpen,
        openBillingModal,
        closeBillingModal,
      }}
    >
      {children}
    </BillingModalContext.Provider>
  );
}

export function useBillingModal() {
  const context = useContext(BillingModalContext);
  if (context === undefined) {
    throw new Error(
      "useBillingModal must be used within a BillingModalProvider"
    );
  }
  return context;
}
