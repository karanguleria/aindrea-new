import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ImageHeader from "./ImageHeader";
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  DollarSign,
  Calendar,
  Users,
  Tag,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import apiService from "@/services/api";
import toast from "react-hot-toast";

export default function EditBrief() {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    projectTitle: "",
    creativeObjective: "",
    requiredSkills: "",
    deliverables: "",
    tags: "",
    budget: "",
    deadline: "",
    contentType: "buy",
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch brief details for editing
  useEffect(() => {
    const fetchBrief = async () => {
      if (!id) return;

      try {
        setInitialLoading(true);
        const response = await apiService.getBriefById(id);

        if (response.success) {
          const brief = response.data.brief;

          // Convert contentTypes object to single contentType
          let contentType = "buy";
          if (brief.contentTypes) {
            if (brief.contentTypes.rent) contentType = "rent";
            else if (brief.contentTypes.buy) contentType = "buy";
            else if (brief.contentTypes.commission) contentType = "commission";
          }

          setFormData({
            projectTitle: brief.projectTitle || "",
            creativeObjective: brief.creativeObjective || "",
            requiredSkills: brief.requiredSkills || "",
            deliverables: brief.deliverables || "",
            tags: brief.tags || "",
            budget: brief.budget?.toString() || "",
            deadline: brief.deadline
              ? new Date(brief.deadline).toISOString().split("T")[0]
              : "",
            contentType: contentType,
          });

          // Set uploaded files if any
          if (brief.referenceFiles && brief.referenceFiles.length > 0) {
            setUploadedFiles(
              brief.referenceFiles.map((file) => ({
                name: file.name || file.originalName,
                size: file.size,
                type: file.type,
                url: file.url,
              }))
            );
          }
        } else {
          toast.error("Failed to load brief details");
          router.push("/dashboard/briefs");
        }
      } catch (error) {
        console.error("Error fetching brief:", error);
        toast.error("Failed to load brief details");
        router.push("/dashboard/briefs");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchBrief();
  }, [id, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.projectTitle ||
      !formData.creativeObjective ||
      !formData.contentType ||
      !formData.budget ||
      !formData.deadline
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const briefData = {
        projectTitle: formData.projectTitle,
        creativeObjective: formData.creativeObjective,
        requiredSkills: formData.requiredSkills,
        deliverables: formData.deliverables,
        tags: formData.tags,
        budget: formData.budget,
        deadline: formData.deadline,
        contentTypes: {
          rent: formData.contentType === "rent",
          buy: formData.contentType === "buy",
          commission: formData.contentType === "commission",
        },
        referenceFiles: uploadedFiles.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.url, // Include existing URLs
        })),
      };

      const response = await apiService.updateBrief(id, briefData);

      if (response.success) {
        toast.success("Brief updated successfully!");
        router.push("/dashboard/briefs");
      } else {
        toast.error(response.message || "Failed to update brief");
      }
    } catch (error) {
      console.error("Error updating brief:", error);
      toast.error(`Failed to update brief: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <ImageHeader title={"Edit Project Brief"} buttonText={"Update Brief"} />

      <div className="rounded-3xl border border-border p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">
              Project Details
            </h3>

            <div className="space-y-2">
              <label
                htmlFor="projectTitle"
                className="block text-foreground font-medium"
              >
                Project Title *
              </label>
              <Input
                type="text"
                id="projectTitle"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-border rounded-lg text-foreground"
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="creativeObjective"
                className="block text-foreground font-medium"
              >
                Creative Objective *
              </label>
              <Textarea
                id="creativeObjective"
                name="creativeObjective"
                value={formData.creativeObjective}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg text-foreground"
                placeholder="Describe your creative objective and project requirements"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="requiredSkills"
                className="block text-foreground font-medium"
              >
                Required Skills
              </label>
              <Textarea
                id="requiredSkills"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-border rounded-lg text-foreground"
                placeholder="List required skills (e.g., Graphic Design, 3D Modeling, Animation)"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="deliverables"
                className="block text-foreground font-medium"
              >
                Deliverables
              </label>
              <Textarea
                id="deliverables"
                name="deliverables"
                value={formData.deliverables}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-border rounded-lg text-foreground"
                placeholder="Specify what you expect to receive (e.g., Source files, High-res images, Video files)"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="tags"
                className="block text-foreground font-medium"
              >
                Tags
              </label>
              <Textarea
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 border border-border rounded-lg text-foreground"
                placeholder="Add relevant tags (e.g., #NFT #DigitalArt #Animation)"
              />
            </div>
          </div>

          {/* Budget and Timeline */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">
              Budget & Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="budget"
                  className="block text-foreground font-medium"
                >
                  Budget (USD) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg text-foreground"
                    placeholder="Enter budget amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="deadline"
                  className="block text-foreground font-medium"
                >
                  Deadline *
                </label>
                <DatePicker
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  placeholder="Select deadline"
                  required
                  className="w-full border border-border rounded-lg text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Content Type temporarily hidden (defaulting to "buy") */}

          {/* Reference Materials */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              Reference Materials (Optional)
            </h3>

            <div
              className={`border-[1px] border-dashed border-border rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-primary bg-card" : "border-border"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16">
                  <Upload className="w-full h-full text-foreground" />
                </div>

                <div className="space-y-2">
                  <p className="text-foreground text-lg font-medium">
                    Drag and drop reference files
                  </p>
                  <label className="cursor-pointer">
                    <span className="text-primary underline">Browse files</span>
                    <input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.svg,.mp4,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-sm text-foreground/70">
                  <p>Max size: 50MB per file</p>
                  <p>JPG, PNG, GIF, SVG, MP4, PDF, DOC</p>
                </div>
              </div>
            </div>

            {/* Display uploaded files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-foreground font-medium">Uploaded files:</p>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-card border border-border text-foreground px-3 py-2 rounded-md"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/briefs")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? "Updating..." : "Update Brief"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
