import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ImageHeader from "./ImageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  FileText,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function RevisionDetail() {
  const router = useRouter();
  const { id, revisionId } = router.query;
  const [brief, setBrief] = useState(null);
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState("");
  const [creatorNoteExpanded, setCreatorNoteExpanded] = useState(true);

  useEffect(() => {
    if (id && revisionId) {
      fetchRevisionDetail();
    }
  }, [id, revisionId]);

  const fetchRevisionDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRevisionHistory(id);
      if (response.success) {
        setBrief(response.data.brief);
        const foundRevision = response.data.revisions.find(
          (r) => r._id === revisionId
        );
        if (foundRevision) {
          setRevision(foundRevision);
        } else {
          toast.error("Revision not found");
          router.back();
        }
      } else {
        toast.error("Failed to load revision details");
      }
    } catch (error) {
      console.error("Error fetching revision detail:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to load revision details");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRevision = async () => {
    try {
      const response = await apiService.acceptRevision(id, revisionId);
      if (response.success) {
        toast.success("Revision accepted successfully");
        fetchRevisionDetail();
      } else {
        toast.error("Failed to accept revision");
      }
    } catch (error) {
      console.error("Error accepting revision:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to accept revision");
    }
  };

  const handleOpenRejectModal = () => {
    setRejectionFeedback("");
    setRejectModalOpen(true);
  };

  const handleRejectRevision = async () => {
    try {
      const response = await apiService.rejectRevision(
        id,
        revisionId,
        rejectionFeedback
      );
      if (response.success) {
        toast.success("Revision rejected successfully");
        setRejectModalOpen(false);
        setRejectionFeedback("");
        fetchRevisionDetail();
      } else {
        toast.error("Failed to reject revision");
      }
    } catch (error) {
      console.error("Error rejecting revision:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to reject revision");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: {
        className: "bg-yellow-500 text-white",
        text: "Pending",
      },
      accepted: {
        className: "bg-green-500 text-white",
        text: "Accepted",
      },
      rejected: {
        className: "bg-red-500 text-white",
        text: "Rejected",
      },
    };
    const config = configs[status] || configs.pending;
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  const getFileOptimizedUrl = (file) => {
    if (!file || typeof file !== "object") return null;
    if (file.optimizedUrl && typeof file.optimizedUrl === "string") {
      return file.optimizedUrl;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading revision details...</p>
        </div>
      </div>
    );
  }

  if (!revision || !brief) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-foreground">Revision not found</p>
      </div>
    );
  }

  // Get main image (first file) and thumbnails (rest)
  const mainImage =
    revision.files && revision.files.length > 0 ? revision.files[0] : null;
  const thumbnails =
    revision.files && revision.files.length > 1 ? revision.files.slice(1) : [];

  const handleBack = () => {
    router.push(`/dashboard/revision-history/${id}`);
  };

  return (
    <>
      <ImageHeader
        title={brief?.projectTitle || "Revision Detail"}
        buttonText="Back"
        onButtonClick={handleBack}
        backRoute={`/dashboard/revision-history/${id}`}
      />
      <div className="text-foreground">
        {/* Main Image Section */}
        {revision.files && revision.files.length > 0 && (
          <div className="p-5 border border-border rounded-lg mb-5">
            <div className="mb-5">
              <h1 className="lg:text-4xl text-2xl font-bold text-foreground mb-2">
                {brief.projectTitle}
              </h1>
              <p className="text-foreground/80 text-lg">
                Creator{" "}
                <span className="text-foreground font-medium">
                  {brief.selectedCreatorId?.fullName ||
                    brief.bids?.find((b) => b.status === "accepted")
                      ?.bidderName ||
                    "N/A"}
                </span>
              </p>
            </div>
            <div className="mb-2">
              {mainImage && (
                <div className="mb-4">
                  <OptimizedImage
                    optimizedUrl={getFileOptimizedUrl(mainImage)}
                    fallbackUrl={mainImage.url}
                    alt={mainImage.name || "Main image"}
                    width={1600}
                    height={900}
                    className="w-full h-[400px] object-cover rounded-lg shadow-3xl"
                  />
                </div>
              )}
              {thumbnails.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {thumbnails.map((file, idx) => (
                    <OptimizedImage
                      key={file._id || idx}
                      optimizedUrl={getFileOptimizedUrl(file)}
                      fallbackUrl={file.url}
                      alt={file.name || `Thumbnail ${idx + 1}`}
                      width={512}
                      height={512}
                      className="w-full h-auto object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Brief Details Card */}
        <Card className="bg-transparent border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground font-bold text-xl">
              Brief Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col gap-2">
                <span className="text-lg text-foreground font-medium mb-1">
                  Status:
                </span>
                <div className="flex items-center gap-2 bg-transparent text-foreground px-3 py-2 rounded-lg border-border border hover:bg-accent transition-colors duration-200">
                  {getStatusBadge(revision.status)}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-lg text-foreground font-medium mb-1">
                  Deadline:
                </span>
                <div className="flex items-center gap-2 bg-transparent text-foreground px-3 py-2 rounded-lg border-border border hover:bg-accent transition-colors duration-200">
                  <Calendar className="h-5 w-5 text-foreground" />
                  <span className="text-sm">
                    {brief.deadline
                      ? new Date(brief.deadline).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-lg text-foreground font-medium mb-1">
                  Budget:
                </span>
                <div className="flex items-center gap-2 bg-transparent text-foreground px-3 py-2 rounded-lg border-border border hover:bg-accent transition-colors duration-200">
                  <DollarSign className="h-5 w-5 text-foreground" />
                  <span className="text-sm">
                    $
                    {(brief.budget || brief.paymentAmount)?.toLocaleString() ||
                      "0.00"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-lg text-foreground font-medium mb-1">
                  Revision #:
                </span>
                <div className="flex items-center gap-2 bg-transparent text-foreground px-3 py-2 rounded-lg border-border border hover:bg-accent transition-colors duration-200">
                  <FileText className="h-5 w-5 text-foreground" />
                  <span className="text-sm">{revision.revisionNumber}</span>
                </div>
              </div>
            </div>
            {revision.status === "pending" && (
              <div className="flex justify-end gap-4">
                <Button
                  className="bg-primary text-primary-foreground px-8 py-5 text-lg"
                  onClick={handleAcceptRevision}
                >
                  Approve & Release Payment
                </Button>
                <Button
                  variant="outline"
                  className="border border-border text-foreground bg-transparent px-8 py-5 text-lg"
                  onClick={handleOpenRejectModal}
                >
                  Request Revision
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Creator's Note Section */}
        {revision.creatorNote && (
          <Card
            className={`bg-transparent mb-8 ${
              creatorNoteExpanded ? "border-primary" : "border-border"
            }`}
          >
            <CardHeader
              className="cursor-pointer"
              onClick={() => setCreatorNoteExpanded(!creatorNoteExpanded)}
            >
              <div className="flex items-center justify-between">
                <CardTitle
                  className={`text-xl font-bold ${
                    creatorNoteExpanded ? "text-primary" : "text-foreground"
                  }`}
                >
                  Creator's Note
                </CardTitle>
                {creatorNoteExpanded ? (
                  <ChevronUp className="h-5 w-5 text-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-foreground" />
                )}
              </div>
            </CardHeader>
            {creatorNoteExpanded && (
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {revision.creatorNote}
                </p>
              </CardContent>
            )}
          </Card>
        )}

        {/* Client Feedback (if rejected) */}
        {revision.status === "rejected" && revision.clientFeedback && (
          <Card className="bg-transparent border-red-200/20 mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-800 dark:text-red-200">
                Rejection Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 dark:text-red-300 leading-relaxed">
                {revision.clientFeedback}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Files Section */}
        {revision.files && revision.files.length > 0 && (
          <Card className="bg-transparent border-border mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground font-bold text-xl">
                Revision Files
              </CardTitle>
              <Download className="h-5 w-5 text-foreground cursor-pointer" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {revision.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative group cursor-pointer"
                    onClick={() => window.open(file.url, "_blank")}
                  >
                    <OptimizedImage
                      optimizedUrl={getFileOptimizedUrl(file)}
                      fallbackUrl={file.url}
                      alt={file.name || `File ${idx + 1}`}
                      width={512}
                      height={512}
                      className="w-full h-auto object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                      <Download className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reject Revision Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Reject Revision
            </DialogTitle>
            <DialogDescription>
              Provide feedback for rejecting this revision (optional)
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectionFeedback">Feedback (Optional)</Label>
                <Textarea
                  id="rejectionFeedback"
                  placeholder="Provide feedback for the creator..."
                  value={rejectionFeedback}
                  onChange={(e) => setRejectionFeedback(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectModalOpen(false);
                setRejectionFeedback("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRejectRevision} variant="destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Reject Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
