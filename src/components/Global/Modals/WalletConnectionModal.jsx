import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { X, Wallet, Shield, Zap, ExternalLink, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useThemeUtils } from "@/hooks/use-theme-utils";

const WalletConnectionModal = ({ isOpen, onClose }) => {
  const { isDark } = useThemeUtils();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "Connect using MetaMask wallet",
      icon: "🦊",
      color: "from-orange-500 to-orange-600",
      popular: true,
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Connect using WalletConnect",
      icon: "🔗",
      color: "from-blue-500 to-blue-600",
      popular: true,
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      description: "Connect using Coinbase Wallet",
      icon: "🪙",
      color: "from-blue-400 to-blue-500",
    },
    {
      id: "phantom",
      name: "Phantom",
      description: "Connect using Phantom wallet",
      icon: "👻",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "trust",
      name: "Trust Wallet",
      description: "Connect using Trust Wallet",
      icon: "🛡️",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      id: "rainbow",
      name: "Rainbow",
      description: "Connect using Rainbow wallet",
      icon: "🌈",
      color: "from-pink-500 to-pink-600",
    },
  ];

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet);
  };

  const handleConnect = async () => {
    if (!selectedWallet) return;

    setIsConnecting(true);

    // Simulate wallet connection
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Here you would implement actual wallet connection logic
      onClose();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInstallWallet = (wallet) => {
    const urls = {
      metamask: "https://metamask.io/download/",
      walletconnect: "https://walletconnect.com/",
      coinbase: "https://wallet.coinbase.com/",
      phantom: "https://phantom.app/",
      trust: "https://trustwallet.com/",
      rainbow: "https://rainbow.me/",
    };

    if (urls[wallet.id]) {
      window.open(urls[wallet.id], "_blank");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal className="py-16">
      <ModalOverlay onClick={onClose} />
      <ModalContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <ModalHeader className="pb-3">
          <div className="flex items-center flex-col justify-center gap-3">
            <Image
              src={isDark ? "/images/logo.png" : "/images/logo.svg"}
              alt="logo"
              width={100}
              height={100}
            />
            <h1 className="font-bold text-foreground lg:text-4xl text-2xl">
              Connect with AiNDREA
            </h1>
          </div>
        </ModalHeader>

        <ModalBody className="py-8">
          <div className="space-y-3">
            {walletOptions.map((wallet) => (
              <div
                key={wallet.id}
                className={`relative py-3 px-2 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedWallet?.id === wallet.id
                    ? "border-cyan-400 bg-background"
                    : "border-border"
                }`}
                onClick={() => handleWalletSelect(wallet)}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl ${wallet.icon}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="font-semibold text-foreground">
                        {wallet.name}
                      </h3>
                      {wallet.popular && (
                        <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-600 to-cyan-500 text-foreground rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/70 mt-1">
                      {wallet.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedWallet?.id === wallet.id && (
                      <div className="w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Install wallet button for non-popular wallets */}
                {!wallet.popular && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInstallWallet(wallet);
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Install
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Security notice */}
          <div className="mt-8 p-6 bg-transparent rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">
                  Secure Connection
                </h4>
                <p className="text-xs text-muted-foreground">
                  Your wallet will only be used to sign transactions and verify
                  your identity. We never have access to your private keys or
                  funds.
                </p>
              </div>
            </div>
          </div>

          {/* Email alternative */}
          <div className="pt-6">
            <div className="flex items-center gap-4 pb-6 ">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-muted-foreground text-sm">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <Button
              variant="outline"
              className="w-full bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              onClick={() => {
                // Handle email continuation logic here
              }}
            >
              <span className="flex-1 text-left">Continue with email</span>
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-foreground" />
              </div>
            </Button>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={!selectedWallet || isConnecting}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Connect {selectedWallet?.name || "Wallet"}
              </>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WalletConnectionModal;
