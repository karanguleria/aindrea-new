import React, { useState, useEffect } from "react";
import ImageHeader from "./ImageHeader";
import {
  ArrowRight,
  Grid3X3,
  List,
  ChevronDown,
  Calendar,
  FileText,
  CheckCircle,
  Search,
  Download,
  Clock,
  AlertCircle,
  RefreshCw,
  DollarSign,
  FileImage,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import WalletConnectionModal from "@/components/Global/Modals/WalletConnectionModal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function Assets() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [dateFilter, setDateFilter] = useState("All Time");
  const [contentTypeFilter, setContentTypeFilter] = useState("All Types");
  const [downloadFilter, setDownloadFilter] = useState("All");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Get backend URL
  const getBackendUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiUrl && typeof window !== "undefined") {
      const currentHost = window.location.hostname;
      if (currentHost.includes("aindrea.ai")) {
        return "https://apis.aindrea.ai";
      }
    }
    return apiUrl || "http://localhost:5012";
  };

  // Create full image URL
  const getFullImageUrl = (url, thumbnail = false) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const backendUrl = getBackendUrl();
    const fullUrl = `${backendUrl}${url.startsWith("/") ? url : "/" + url}`;
    // Add thumbnail parameter for preview images to reduce load time
    if (thumbnail && url.includes("/api/images/")) {
      return `${fullUrl}?thumbnail=true`;
    }
    return fullUrl;
  };

  const getOptimizedAssetUrl = (license, thumbnail = false) => {
    const optimized = license?.assetMetadata?.optimizedUrl;
    if (!optimized || typeof optimized !== "string") {
      return null;
    }
    return getFullImageUrl(optimized, thumbnail);
  };

  // Fetch user licenses
  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserLicenses();

      if (response.success) {
        setLicenses(response.data.licenses);
      } else {
        toast.error("Failed to load assets");
      }
    } catch (error) {
      console.error("Error fetching licenses:", error);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  // Download asset
  const handleDownload = async (licenseId, filename) => {
    try {
      setDownloading((prev) => ({ ...prev, [licenseId]: true }));

      const { data: blob, headers } = await apiService.downloadAsset(licenseId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const headerFilename = headers
        ?.get("content-disposition")
        ?.match(/filename="(.+)"/)?.[1];
      a.download = filename || headerFilename || "asset.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Asset downloaded successfully!");
      fetchLicenses(); // Refresh to update download count
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to download asset");
    } finally {
      setDownloading((prev) => ({ ...prev, [licenseId]: false }));
    }
  };

  // Repurchase rented asset
  const handleRepurchase = async (licenseId) => {
    try {
      const response = await apiService.repurchaseRentedAsset(licenseId);

      if (response.success) {
        toast.success("Redirecting to payment...");
        const isCreator = router.pathname.startsWith("/creator");
        const checkoutPath = isCreator
          ? "/creator/stripe-payment-checkout"
          : "/dashboard/stripe-payment-checkout";
        router.push(`${checkoutPath}?repurchase=${licenseId}`);
      }
    } catch (error) {
      console.error("Repurchase error:", error);
      toast.error("Failed to initiate repurchase");
    }
  };

  // Get status badge
  const getStatusBadge = (license) => {
    if (license.licenseType === "rent") {
      if (license.isExpired) {
        return (
          <Badge variant="destructive" className="bg-red-500">
            Expired
          </Badge>
        );
      } else {
        return (
          <Badge variant="secondary" className="bg-blue-500">
            Active
          </Badge>
        );
      }
    } else {
      return (
        <Badge variant="default" className="bg-green-500">
          Owned
        </Badge>
      );
    }
  };

  // Filter licenses
  const filteredLicenses = licenses.filter((license) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      license.assetMetadata?.prompt
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      license.assetMetadata?.filename
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Content type filter
    const matchesContentType =
      contentTypeFilter === "All Types" ||
      (contentTypeFilter === "Digital Art" &&
        license.licenseType === "purchase") ||
      (contentTypeFilter === "AI Generated" &&
        license.assetMetadata?.source !== "upload");

    // Download filter
    const matchesDownload =
      downloadFilter === "All" ||
      (downloadFilter === "Downloaded" && license.downloadCount > 0) ||
      (downloadFilter === "Not Downloaded" && license.downloadCount === 0);

    // Date filter
    let matchesDate = true;
    const createdDate = new Date(license.createdAt);
    const now = new Date();
    if (dateFilter === "Last 7 Days") {
      matchesDate = (now - createdDate) / (1000 * 60 * 60 * 24) <= 7;
    } else if (dateFilter === "Last 30 Days") {
      matchesDate = (now - createdDate) / (1000 * 60 * 60 * 24) <= 30;
    } else if (dateFilter === "Last 90 Days") {
      matchesDate = (now - createdDate) / (1000 * 60 * 60 * 24) <= 90;
    } else if (dateFilter === "This Year") {
      matchesDate = createdDate.getFullYear() === now.getFullYear();
    }

    return (
      matchesSearch && matchesContentType && matchesDownload && matchesDate
    );
  });

  const nftData = [
    {
      id: 1,
      image: "/images/client/assets/assets1.png",
      title: "Your NFT has been minted on Polygon",
      tokenId: "123456789",
      mintDate: "April 8, 2025",
      tags: ["#digital art", "#AI-enhanced", "#futuristic", "#abstract"],
      status: "NFT held in escrow - Connect your wallet to claim ownership",
    },
    {
      id: 2,
      image: "/images/client/assets/assets2.png",
      title: "Your NFT has been minted on Polygon",
      tokenId: "123456790",
      mintDate: "April 8, 2025",
      tags: ["#digital art", "#AI-enhanced", "#futuristic", "#abstract"],
      status: "NFT held in escrow - Connect your wallet to claim ownership",
    },
    {
      id: 3,
      image: "/images/client/assets/assets3.png",
      title: "Your NFT has been minted on Polygon",
      tokenId: "123456791",
      mintDate: "April 8, 2025",
      tags: ["#digital art", "#AI-enhanced", "#futuristic", "#abstract"],
      status: "NFT held in escrow - Connect your wallet to claim ownership",
    },
  ];

  const renderGridCard = (license) => (
    <div key={license.id} className="p-4 border border-border rounded-2xl">
      <div className="overflow-hidden transition-all">
        {/* Asset Preview */}
        <div className="relative mb-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
            {license.assetMetadata?.imageUrl ? (
              <OptimizedImage
                optimizedUrl={getOptimizedAssetUrl(license, true)}
                fallbackUrl={getFullImageUrl(license.assetMetadata.imageUrl, true)}
                alt={license.assetMetadata.filename || "Asset"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            ) : null}
            <div
              className="w-full h-full flex items-center justify-center bg-muted absolute inset-0"
              style={{
                display: license.assetMetadata?.imageUrl ? "none" : "flex",
              }}
            >
              <FileImage className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            {getStatusBadge(license)}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-3 text-lg line-clamp-2">
            {license.assetMetadata?.prompt ||
              license.assetMetadata?.filename ||
              "Untitled Asset"}
          </h3>

          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              {license.licenseType === "purchase" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-blue-500" />
              )}
              <span className="text-sm font-medium text-foreground capitalize">
                {license.licenseType} License
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />${license.price.toFixed(2)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(license.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Rental Info */}
            {license.licenseType === "rent" && (
              <div className="text-xs text-muted-foreground">
                {license.isExpired ? (
                  <span className="text-red-500">
                    Expired{" "}
                    {new Date(license.rentalEndDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span>
                    Expires{" "}
                    {new Date(license.rentalEndDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}

            {/* Download Info */}
            {/* <div className="text-xs text-muted-foreground">
              Downloads: {license.downloadCount}/{license.maxDownloads}
            </div> */}
          </div>

          <div className="space-y-2">
            {license.canDownload ? (
              <Button
                onClick={() =>
                  handleDownload(license.id, license.assetMetadata?.filename)
                }
                disabled={downloading[license.id]}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {downloading[license.id] ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Asset
                  </>
                )}
              </Button>
            ) : (
              <Button variant="outline" disabled className="w-full">
                <AlertCircle className="h-4 w-4 mr-2" />
                {license.isExpired
                  ? "License Expired"
                  : "Download Limit Reached"}
              </Button>
            )}

            {license.canRepurchase && (
              <Button
                variant="outline"
                onClick={() => handleRepurchase(license.id)}
                className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900"
              >
                Repurchase License
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderListItem = (license) => (
    <div
      key={license.id}
      className="p-4 bg-transparent border border-border grid lg:grid-cols-12 lg:gap-6 items-center rounded-2xl mb-4"
    >
      <div className="lg:col-span-3">
        <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
          {license.assetMetadata?.imageUrl ? (
            <OptimizedImage
              optimizedUrl={getOptimizedAssetUrl(license, true)}
              fallbackUrl={getFullImageUrl(license.assetMetadata.imageUrl, true)}
              alt={license.assetMetadata.filename || "Asset"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 25vw"
            />
          ) : null}
          <div
            className="w-full h-full flex items-center justify-center bg-muted absolute inset-0"
            style={{
              display: license.assetMetadata?.imageUrl ? "none" : "flex",
            }}
          >
            <FileImage className="h-8 w-8 text-muted-foreground" />
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            {getStatusBadge(license)}
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <h3 className="font-semibold text-foreground mb-2 text-lg line-clamp-2">
          {license.assetMetadata?.prompt ||
            license.assetMetadata?.filename ||
            "Untitled Asset"}
        </h3>

        <div className="mb-3 space-y-2">
          <div className="flex items-center gap-2">
            {license.licenseType === "purchase" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Clock className="h-4 w-4 text-blue-500" />
            )}
            <span className="text-sm font-medium text-foreground capitalize">
              {license.licenseType} License
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />${license.price.toFixed(2)}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(license.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Rental Info */}
          {license.licenseType === "rent" && (
            <div className="text-xs text-muted-foreground">
              {license.isExpired ? (
                <span className="text-red-500">
                  Expired {new Date(license.rentalEndDate).toLocaleDateString()}
                </span>
              ) : (
                <span>
                  Expires {new Date(license.rentalEndDate).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Download Info */}
          {/* <div className="text-xs text-muted-foreground">
            Downloads: {license.downloadCount}/{license.maxDownloads}
          </div> */}
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:col-span-4">
        {license.canDownload ? (
          <Button
            onClick={() =>
              handleDownload(license.id, license.assetMetadata?.filename)
            }
            disabled={downloading[license.id]}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {downloading[license.id] ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Asset
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" disabled className="w-full">
            <AlertCircle className="h-4 w-4 mr-2" />
            {license.isExpired ? "License Expired" : "Download Limit Reached"}
          </Button>
        )}

        {license.canRepurchase && (
          <Button
            variant="outline"
            onClick={() => handleRepurchase(license.id)}
            className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900"
          >
            Repurchase License
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ImageHeader title={"Assets"} buttonText={`${licenses.length} Total`} />
      <div className=" text-foreground">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-transparent  rounded-lg border border-border transition-colors">
                  <Calendar className="w-4 h-4" />
                  {dateFilter}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border text-foreground min-w-[180px]">
                <DropdownMenuLabel className="text-muted-foreground">
                  Filter by Date
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => setDateFilter("All Time")}>
                  All Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("Last 7 Days")}>
                  Last 7 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("Last 30 Days")}>
                  Last 30 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("Last 90 Days")}>
                  Last 90 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("This Year")}>
                  This Year
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Content Type Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-transparent  rounded-lg border border-border transition-colors">
                  <FileText className="w-4 h-4" />
                  {contentTypeFilter}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border text-foreground min-w-[180px]">
                <DropdownMenuLabel className="text-muted-foreground">
                  Content Type
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => setContentTypeFilter("All Types")}
                >
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setContentTypeFilter("Digital Art")}
                >
                  Digital Art
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setContentTypeFilter("AI Generated")}
                >
                  AI Generated
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setContentTypeFilter("Photography")}
                >
                  Photography
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setContentTypeFilter("Illustrations")}
                >
                  Illustrations
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Download Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-transparent  rounded-lg border border-border transition-colors">
                  <CheckCircle className="w-4 h-4" />
                  {downloadFilter}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border text-foreground min-w-[180px]">
                <DropdownMenuLabel className="text-muted-foreground">
                  Download Status
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => setDownloadFilter("All")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDownloadFilter("Downloaded")}
                >
                  Downloaded
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDownloadFilter("Not Downloaded")}
                >
                  Not Downloaded
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle Buttons */}
            <div className="flex border border-border  rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent "
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-cyan-400 text-foreground"
                    : "bg-transparent"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative ">
            <Input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-12 bg-card border border-border rounded-lg text-foreground  transition-colors w-72"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Items Count */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-300">
            {filteredLicenses.length} Items
          </h3>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-foreground">Loading assets...</span>
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className="text-center py-20">
            <FileImage className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {licenses.length === 0 ? "No Assets Yet" : "No assets found"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {licenses.length === 0
                ? "Purchase or rent assets to see them here"
                : "Try adjusting your filters or search term"}
            </p>
          </div>
        ) : /* Content based on view mode */
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLicenses.map(renderGridCard)}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLicenses.map(renderListItem)}
          </div>
        )}
      </div>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
}
