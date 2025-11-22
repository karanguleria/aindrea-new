import { AuthLoading } from "@/components/common/AuthLoading";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { useAuth, UserAuthProvider } from "@/contexts/userContext";
import { ChatProvider } from "@/contexts/chatContext";
import { SocketProvider } from "@/contexts/socketContext";
import { UsageProvider } from "@/contexts/usageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import {
  ProfileModalProvider,
  useProfileModal,
} from "@/contexts/profileModalContext";
import {
  BillingModalProvider,
  useBillingModal,
} from "@/contexts/billingModalContext";
import {
  PreviewModalProvider,
  usePreviewModal,
} from "@/contexts/previewModalContext";
import ProfileUpdateModal from "@/components/common/ProfileUpdateModal";
import BillingPackagesModal from "@/components/common/BillingPackagesModal";
import PreviewModal from "@/components/clients/chat/PreviewModal";
import PersistentLayout from "@/components/common/PersistentLayout";
import "@/styles/globals.css";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

function AuthGuard({ children }) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user, logout } = useAuth();
  const hasInitialized = useRef(false);

  // Pages that don't require authentication (public pages)
  const publicPages = ["/wallet-demo"];

  // Auth pages (login, signup, forgot password, etc.)
  const authPages = [
    "/",
    "/client-signup",
    "/creator-signup",
    "/forgot-password",
    "/reset-password",
  ];

  // Profile setup pages (Step 2) - these should redirect to Step 1 if not completed
  const profileSetupPages = ["/client-profile-setup", "/creator-profile-setup"];

  useEffect(() => {
    if (!authLoading) {
      // Clear stuck isLoggingOut flag if user is authenticated
      if (typeof window !== "undefined" && isAuthenticated()) {
        const isLoggingOut = localStorage.getItem("isLoggingOut") === "true";
        if (isLoggingOut) {
          // If user is authenticated but flag is set, clear it (stuck flag)
          localStorage.removeItem("isLoggingOut");
        }
      }

      const currentPath = router.pathname;
      const isPublicPage = publicPages.some((page) => page === currentPath);
      const isAuthPage = authPages.some((page) => page === currentPath);
      const isProfileSetupPage = profileSetupPages.some(
        (page) => page === currentPath
      );
      const authenticated = isAuthenticated();

      if (authenticated) {
        // User is logged in

        // Block admin users from accessing auth pages - force logout
        if (user && user.isAdmin && isAuthPage) {
          logout();
          router.replace("/");
          return;
        }

        if (isAuthPage) {
          // If logged in user tries to access auth pages, redirect by role
          if (user && user.creator) {
            router.replace("/creator/dashboard");
          } else {
            router.replace("/dashboard");
          }
          return;
        }

        // Enforce role-based route access
        const isCreatorRoute = currentPath.startsWith("/creator");
        const isClientRoute = currentPath.startsWith("/dashboard");

        if (isCreatorRoute && !(user && user.creator)) {
          // Not a creator but trying to access creator routes
          router.replace("/dashboard");
          return;
        }

        if (isClientRoute && !(user && (user.client || !user.creator))) {
          // Not a client but trying to access client routes
          router.replace("/creator/dashboard");
          return;
        }
      } else {
        // User is not logged in
        if (isProfileSetupPage) {
          // Check localStorage to see if step 1 data exists
          let localStorageData = null;
          const storageKey =
            currentPath === "/client-profile-setup"
              ? "clientSignupData"
              : "creatorSignupData";

          if (
            typeof window !== "undefined" &&
            localStorage.getItem(storageKey)
          ) {
            try {
              localStorageData = JSON.parse(localStorage.getItem(storageKey));
            } catch (e) {
              console.error("Error parsing localStorage data in _app.js:", e);
            }
          }

          if (!localStorageData) {
            // If trying to access profile setup without completing step 1, redirect to appropriate signup
            if (currentPath === "/client-profile-setup") {
              router.replace("/client-signup");
            } else if (currentPath === "/creator-profile-setup") {
              router.replace("/creator-signup");
            }
            return;
          }
          // If step 1 data exists, allow access to profile setup page
        }

        if (!isPublicPage && !isAuthPage && !isProfileSetupPage) {
          // If not logged in and trying to access protected pages, redirect to client signup
          router.replace("/");
          return;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, isAuthenticated, authLoading, user]);

  // Track if we've completed initial auth check
  useEffect(() => {
    if (!authLoading) {
      hasInitialized.current = true;
    }
  }, [authLoading]);

  // Only show loading during initial auth check (first mount), not on page changes
  if (authLoading && !hasInitialized.current) {
    return <AuthLoading message="Checking authentication..." />;
  }

  return children;
}

function ProfileModalWrapper() {
  const { isProfileModalOpen, closeProfileModal } = useProfileModal();

  return (
    <ProfileUpdateModal
      isOpen={isProfileModalOpen}
      onClose={closeProfileModal}
    />
  );
}

function BillingModalWrapper() {
  const { isBillingModalOpen, closeBillingModal } = useBillingModal();

  return (
    <BillingPackagesModal
      isOpen={isBillingModalOpen}
      onClose={closeBillingModal}
    />
  );
}

function PreviewModalWrapper() {
  const {
    isPreviewModalOpen,
    previewImage,
    closePreviewModal,
    onSelectVariantCallback,
  } = usePreviewModal();

  return (
    <PreviewModal
      open={isPreviewModalOpen}
      image={previewImage}
      onClose={closePreviewModal}
      onSelectVariant={onSelectVariantCallback}
    />
  );
}

function AppContent({ Component, pageProps }) {
  const router = useRouter();

  // Configure NProgress
  useEffect(() => {
    NProgress.configure({
      showSpinner: false,
      trickleSpeed: 200,
      minimum: 0.08,
    });

    const handleStart = (url) => {
      // Only show progress if navigating to a different page
      if (url !== router.asPath) {
        NProgress.start();
      }
    };

    const handleStop = () => {
      NProgress.done();
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  // Pages that should use persistent layout (dashboard and creator pages)
  // Exclude pages that use their own layout (like creator dashboard with SplitChatLayout)
  const isCreatorDashboard = router.pathname === "/creator/dashboard";
  const usePersistentLayout =
    (router.pathname?.startsWith("/dashboard") ||
      router.pathname?.startsWith("/creator")) &&
    !isCreatorDashboard;

  return (
    <>
      {usePersistentLayout ? (
        <PersistentLayout>
          <Component {...pageProps} />
        </PersistentLayout>
      ) : (
        <Component {...pageProps} />
      )}
      <ProfileModalWrapper />
      <BillingModalWrapper />
      <PreviewModalWrapper />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
          success: {
            iconTheme: {
              primary: "var(--primary)",
              secondary: "var(--primary-foreground)",
            },
          },
          error: {
            iconTheme: {
              primary: "hsl(var(--destructive))",
              secondary: "hsl(var(--destructive-foreground))",
            },
          },
        }}
      />
    </>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserAuthProvider>
          <SocketProvider>
            <UsageProvider>
              <ChatProvider>
                <ProfileModalProvider>
                  <BillingModalProvider>
                    <PreviewModalProvider>
                      <AuthGuard>
                        <AppContent
                          Component={Component}
                          pageProps={pageProps}
                        />
                      </AuthGuard>
                    </PreviewModalProvider>
                  </BillingModalProvider>
                </ProfileModalProvider>
              </ChatProvider>
            </UsageProvider>
          </SocketProvider>
        </UserAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
