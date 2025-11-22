import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import WalletConnectionModal from "@/components/Global/Modals/WalletConnectionModal";
import { Wallet, Zap } from "lucide-react";

export default function WalletDemo() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-primary to-primary/80 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Wallet Connection Demo
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Click the button below to see the wallet connection modal in action
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => setIsWalletModalOpen(true)}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-8 py-4 text-lg font-semibold"
          >
            <Zap className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>
          
          <p className="text-muted-foreground text-sm">
            This modal supports MetaMask, WalletConnect, Coinbase Wallet, and more
          </p>
        </div>

        {/* Wallet Connection Modal */}
        <WalletConnectionModal 
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
        />
      </div>
    </div>
  );
}
