import BriefStripePaymentCheckout from "@/components/modules/client/BriefStripePaymentCheckout";
import ChatSection from "@/components/modules/client/ChatSection";
import { useState } from "react";


export default function MainContent() {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex-1 bg-background flex min-h-screen">
      <ChatSection />
      <div className="w-[75%] p-6 overflow-y-auto min-h-[90dvh]">
        <BriefStripePaymentCheckout />
      </div>
    </div>
  );
}
