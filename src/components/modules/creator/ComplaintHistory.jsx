import React, { useState, useEffect } from "react";
import ImageHeader from "../client/ImageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  RefreshCw,
  ExternalLink,
  Trash2,
  Eye,
  ChevronDown,
} from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function ComplaintHistory() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserComplaints(statusFilter);
      if (response.success) {
        setComplaints(response.data.complaints);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (complaintId) => {
    if (!confirm("Are you sure you want to delete this complaint?")) {
      return;
    }

    try {
      const response = await apiService.deleteComplaint(complaintId);
      if (response.success) {
        toast.success("Complaint deleted successfully");
        fetchComplaints();
      }
    } catch (error) {
      console.error("Error deleting complaint:", error);
      toast.error(error.message || "Failed to delete complaint");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", icon: Clock, label: "Pending" },
      "in-review": {
        color: "bg-blue-500",
        icon: RefreshCw,
        label: "In Review",
      },
      resolved: { color: "bg-green-500", icon: CheckCircle, label: "Resolved" },
      rejected: { color: "bg-red-500", icon: AlertCircle, label: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge
        variant="default"
        className={`${config.color} flex items-center gap-1`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getComplaintTypeLabel = (type) => {
    const types = {
      quality: "Quality Issue",
      delivery: "Delivery Problem",
      communication: "Communication Issue",
      other: "Other",
    };
    return types[type] || type;
  };

  const viewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetails(true);
  };

  return (
    <div className="">
      <ImageHeader
        title="Complaint History"
        buttonText={`${complaints.length} Complaints`}
      />

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent rounded-lg border border-border transition-colors">
              <Filter className="w-4 h-4" />
              {statusFilter
                ? statusFilter
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")
                : "All Status"}
              <ChevronDown className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border text-foreground min-w-[180px]">
            <DropdownMenuLabel className="text-muted-foreground">
              Filter by Status
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("in-review")}>
              In Review
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("resolved")}>
              Resolved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
              Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          onClick={() => router.push("/creator/complaints")}
        >
          New Complaint
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-foreground">Loading complaints...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 bg-transparent border border-border rounded-2xl">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Complaints Found
          </h3>
          <p className="text-muted-foreground mb-6">
            {statusFilter
              ? `No complaints with status "${statusFilter}"`
              : "You haven't filed any complaints yet"}
          </p>
          <Button onClick={() => router.push("/creator/complaints")}>
            File a Complaint
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div
              key={complaint._id}
              className="p-6 bg-transparent border border-border rounded-2xl hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {complaint.assetName}
                    </h3>
                    {getStatusBadge(complaint.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {getComplaintTypeLabel(complaint.complainType)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Submitted:{" "}
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewDetails(complaint)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {complaint.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(complaint._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-foreground line-clamp-2">
                  {complaint.complainSummary}
                </p>
              </div>

              {complaint.adminResponse && (
                <div className="mt-4 bg-primary/10 rounded-lg p-4 border border-primary/30">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Admin Response:
                  </p>
                  <p className="text-sm text-foreground/90">
                    {complaint.adminResponse}
                  </p>
                </div>
              )}

              {complaint.evidenceUrl && (
                <div className="mt-4">
                  <a
                    href={complaint.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Evidence
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Details Modal (Simple implementation) */}
      {showDetails && selectedComplaint && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Complaint Details
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(false)}
              >
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Asset Name
                </label>
                <p className="text-foreground">{selectedComplaint.assetName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Complaint Type
                </label>
                <p className="text-foreground">
                  {getComplaintTypeLabel(selectedComplaint.complainType)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="mt-1">
                  {getStatusBadge(selectedComplaint.status)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Complaint Summary
                </label>
                <p className="text-foreground mt-1 whitespace-pre-wrap">
                  {selectedComplaint.complainSummary}
                </p>
              </div>

              {selectedComplaint.evidenceUrl && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Evidence
                  </label>
                  <a
                    href={selectedComplaint.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-1 text-primary hover:underline"
                  >
                    View Evidence File
                  </a>
                </div>
              )}

              {selectedComplaint.adminResponse && (
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                  <label className="text-sm font-medium text-foreground">
                    Admin Response
                  </label>
                  <p className="text-foreground/90 mt-2 whitespace-pre-wrap">
                    {selectedComplaint.adminResponse}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Submitted On
                </label>
                <p className="text-foreground">
                  {new Date(selectedComplaint.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedComplaint.resolvedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Resolved On
                  </label>
                  <p className="text-foreground">
                    {new Date(selectedComplaint.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
