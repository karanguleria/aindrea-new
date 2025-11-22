import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ImageHeader from "./ImageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronUp,
  ChevronDown,
  FileText,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function RevisionHistory() {
  const router = useRouter();
  const { id } = router.query;
  const [brief, setBrief] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRevisions, setExpandedRevisions] = useState({});

  useEffect(() => {
    if (id) {
      fetchRevisionHistory();
    }
  }, [id]);

  const fetchRevisionHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRevisionHistory(id);
      if (response.success) {
        setBrief(response.data.brief);
        setRevisions(response.data.revisions || []);
      } else {
        toast.error("Failed to load revision history");
      }
    } catch (error) {
      console.error("Error fetching revision history:", error);
      if (error.status === 401) {
        return;
      }
      toast.error("Failed to load revision history");
    } finally {
      setLoading(false);
    }
  };

  const toggleRevision = (revisionId) => {
    setExpandedRevisions((prev) => ({
      ...prev,
      [revisionId]: !prev[revisionId],
    }));
  };

  const handleViewDetails = (revisionId) => {
    router.push(`/dashboard/revision-history/${id}/${revisionId}`);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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
        icon: Clock,
      },
      accepted: {
        className: "bg-green-500 text-white",
        text: "Accepted",
        icon: CheckCircle,
      },
      rejected: {
        className: "bg-red-500 text-white",
        text: "Rejected",
        icon: XCircle,
      },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
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
          <p className="text-foreground">Loading revision history...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ImageHeader
        title={brief?.projectTitle || "Revision History"}
        buttonText="Back to Brief"
        onButtonClick={() => router.push(`/dashboard/brief-details/${id}`)}
      />
      <div className="space-y-6 sm:space-y-8 rounded-3xl p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Revision History
          </h2>
          {revisions.length > 0 && (
            <Badge variant="outline" className="text-sm">
              {revisions.length}{" "}
              {revisions.length === 1 ? "Revision" : "Revisions"}
            </Badge>
          )}
        </div>

        {revisions.length === 0 ? (
          <Card className="bg-muted-background border-border">
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Revisions Yet
              </h3>
              <p className="text-muted-foreground">
                No revisions have been requested for this project yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {revisions.map((revision, index) => {
              const isExpanded = expandedRevisions[revision._id];
              const mainImage =
                revision.files && revision.files.length > 0
                  ? revision.files[0]
                  : null;
              const thumbnails =
                revision.files && revision.files.length > 1
                  ? revision.files.slice(1, 5)
                  : [];

              return (
                <Card
                  key={revision._id}
                  className={`bg-muted-background border-border transition-all ${
                    isExpanded ? "border-primary shadow-lg" : "hover:shadow-md"
                  }`}
                >
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => toggleRevision(revision._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg font-semibold text-foreground">
                            Revision #{revision.revisionNumber || index + 1}
                          </CardTitle>
                        </div>
                        {getStatusBadge(revision.status)}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(revision.createdAt)}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="space-y-6 pt-0">
                      {/* Creator Note */}
                      {revision.creatorNote && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-foreground">
                            Creator's Note
                          </h4>
                          <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-4">
                            {revision.creatorNote}
                          </p>
                        </div>
                      )}

                      {/* Images Section */}
                      {revision.files && revision.files.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-foreground">
                            Files ({revision.files.length})
                          </h4>
                          {mainImage && (
                            <div className="rounded-lg overflow-hidden border border-border">
                              <OptimizedImage
                                optimizedUrl={getFileOptimizedUrl(mainImage)}
                                fallbackUrl={mainImage.url}
                                alt={mainImage.name || "Main image"}
                                width={1600}
                                height={900}
                                className="w-full h-auto max-h-[500px] object-contain bg-muted"
                              />
                            </div>
                          )}
                          {thumbnails.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {thumbnails.map((file, idx) => (
                                <div
                                  key={file._id || idx}
                                  className="rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                                >
                                  <OptimizedImage
                                    optimizedUrl={getFileOptimizedUrl(file)}
                                    fallbackUrl={file.url}
                                    alt={file.name || `Thumbnail ${idx + 1}`}
                                    width={512}
                                    height={512}
                                    className="w-full h-32 object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Client Feedback (if rejected) */}
                      {revision.status === "rejected" &&
                        revision.clientFeedback && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">
                              Rejection Feedback
                            </h4>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                              <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                                {revision.clientFeedback}
                              </p>
                            </div>
                          </div>
                        )}

                      {/* View Details Button */}
                      <div className="flex justify-end pt-4 border-t border-border">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(revision._id);
                          }}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Details
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
