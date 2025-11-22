import React, { useState, useEffect, useCallback, useRef } from "react";
import ImageHeader from "./ImageHeader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useChat } from "@/contexts/chatContext";
// import CreatorSelector from "./CreatorSelector"; // Hidden for now
import ChatSelector from "./ChatSelector";

export default function CreateNewBrief() {
  const router = useRouter();
  const { currentChatId } = useChat();
  const [formData, setFormData] = useState({
    projectTitle: "",
    creativeObjective: "",
    requiredSkills: "",
    deliverables: "",
    tags: "",
    budget: "",
    deadline: "",
    contentType: "buy",
    selectedCreatorId: null,
    chatId: null,
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extractingDetails, setExtractingDetails] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const hasExtractedRef = useRef(false); // Track if extraction has already been done

  // Extract brief details function (reusable)
  const extractBriefDetails = useCallback(async (chatId, force = false) => {
    if (!chatId) return;

    // Don't extract if already extracted (unless forced)
    if (hasExtractedRef.current && !force) {
      console.log("[CreateNewBrief] Extraction already done, skipping...");
      setInitialLoad(false);
      return;
    }

    hasExtractedRef.current = true; // Mark as extracted
    setExtractingDetails(true);
    try {
      const response = await apiService.extractBriefDetailsFromChat(chatId);
      if (response.success && response.data.briefDetails) {
        const details = response.data.briefDetails;
        setFormData((prev) => ({
          ...prev,
          projectTitle: details.projectTitle || prev.projectTitle,
          creativeObjective:
            details.creativeObjective || prev.creativeObjective,
          requiredSkills: details.requiredSkills || prev.requiredSkills,
          deliverables: details.deliverables || prev.deliverables,
          tags: details.tags || prev.tags,
          budget: details.budget || prev.budget,
          deadline: details.deadline || prev.deadline,
          contentType: details.contentType || prev.contentType,
        }));
        toast.success("Brief details extracted from chat conversation!");
      }
    } catch (error) {
      console.error("Error extracting brief details:", error);
      toast.error(
        "Failed to extract details from chat. You can fill the form manually."
      );
      // Reset the ref on error so user can retry if needed
      hasExtractedRef.current = false;
    } finally {
      setExtractingDetails(false);
      setInitialLoad(false);
    }
  }, []);

  // Track the chatId we've extracted for to prevent re-extraction
  const extractedChatIdRef = useRef(null);

  // Check for chatId in URL query params or from chat context (SplitChatLayout)
  useEffect(() => {
    // Only run if router is ready
    if (!router.isReady) {
      return;
    }

    // Get chatId from URL first (handle both chatId and id query params)
    let chatId = router.query.chatId || router.query.id;
    
    // If no chatId in URL, try to get it from chat context (for SplitChatLayout)
    if (!chatId && currentChatId) {
      chatId = currentChatId;
    }
    
    const normalizedChatId = Array.isArray(chatId) ? chatId[0] : chatId;

    // If no chatId, just set initialLoad to false
    if (!normalizedChatId || typeof normalizedChatId !== "string") {
      setInitialLoad(false);
      return;
    }

    // If we've already extracted for this chatId, skip
    if (hasExtractedRef.current && extractedChatIdRef.current === normalizedChatId) {
      setInitialLoad(false);
      return;
    }

    // Reset if chatId changed (user navigated to different chat)
    if (extractedChatIdRef.current && extractedChatIdRef.current !== normalizedChatId) {
      hasExtractedRef.current = false;
    }

    // Set chatId in form data
    setFormData((prev) => ({
      ...prev,
      chatId: normalizedChatId,
    }));

    // Auto-extract details (only once per chatId)
    extractedChatIdRef.current = normalizedChatId;
    extractBriefDetails(normalizedChatId);
  }, [router.isReady, router.query.chatId, router.query.id, currentChatId, extractBriefDetails]);

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

  // Creator selection handlers - commented out since section is hidden
  // const handleCreatorSelect = (creatorId) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     selectedCreatorId: creatorId,
  //   }));
  // };

  // const handleCreatorClear = () => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     selectedCreatorId: null,
  //   }));
  // };

  const handleChatSelect = async (chatId) => {
    setFormData((prev) => ({
      ...prev,
      chatId: chatId,
    }));

    // Extract brief details from chat conversation (force extraction for manual selection)
    await extractBriefDetails(chatId, true);
  };

  const handleChatClear = () => {
    setFormData((prev) => ({
      ...prev,
      chatId: null,
    }));
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
        projectDescription: formData.projectDescription,
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
        })),
        selectedCreatorId: formData.selectedCreatorId,
        chatId: formData.chatId,
        status: "draft",
      };

      const response = await apiService.createBrief(briefData);

      if (response.success) {
        toast.success("Brief created successfully!");
        // Redirect to payment checkout
        router.push(
          `/dashboard/brief-stripe-payment-checkout?briefId=${response.data.brief._id}`
        );
      } else {
        toast.error("Failed to create brief");
      }
    } catch (error) {
      console.error("Error creating brief:", error);
      toast.error("Failed to create brief");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {(extractingDetails || initialLoad) && (
        <div className="fixed inset-0 bg-background/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-muted-background border border-border rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Generating Brief
                </h3>
                <p className="text-sm text-muted-foreground">
                  Analyzing your chat conversation and extracting project
                  details...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ImageHeader
        title={"Create Project Brief"}
        buttonText={"Publish Brief"}
      />

      <div
        className={`rounded-3xl border border-border p-6 max-w-4xl mx-auto ${
          extractingDetails || initialLoad
            ? "opacity-50 pointer-events-none"
            : ""
        }`}
      >
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

          {/* Chat Linking (Optional) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Link Chat (Optional)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Select a chat conversation to link to this brief. Creators will
                be able to see what you were trying to create.
              </p>
              <p className="text-xs text-muted-foreground mt-1 italic">
                Note: You can also link a chat after creating the brief from the
                brief details page.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ChatSelector
                selectedChatId={formData.chatId}
                onSelectChat={handleChatSelect}
                onClearSelection={handleChatClear}
                disabled={loading || extractingDetails}
              />
              {extractingDetails && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Extracting details from chat...
                </div>
              )}
              {formData.chatId && !extractingDetails && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleChatClear}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Creator Selection - Hidden for now, defaults to open for all */}
          {/* <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Creator Selection (Optional)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Select a specific creator for this brief, or leave it open for all creators to bid
              </p>
            </div>
            <CreatorSelector
              selectedCreatorId={formData.selectedCreatorId}
              onSelectCreator={handleCreatorSelect}
              onClearSelection={handleCreatorClear}
              disabled={loading}
            />
          </div> */}

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
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? "Publishing..." : "Publish Brief"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
