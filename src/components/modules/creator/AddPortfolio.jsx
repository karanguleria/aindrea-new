import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ImageHeader from "../client/ImageHeader";

export default function AddPortfolio() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    category: "",
  });
  const fileInputRef = useRef(null);

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
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  const handleSkip = () => {
    // Handle skip logic here
  };

  return (
    <>
      <ImageHeader title={"Add Portfolio"} buttonText={"Hello"} />
      <div className="p-4 sm:p-6 border border-border rounded-3xl space-y-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div
              className={cn(
                "relative border-2 border-dashed border-border rounded-lg  transition-colors",
                dragActive ? "border-primary bg-primary/5" : "border-border"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="rounded-lg p-5 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-foreground font-medium">
                      Drag and drop media
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary hover:text-primary/80 underline"
                    >
                      Browse files
                    </button>
                    <p className="text-sm text-muted-foreground">
                      Max size: 50MB
                    </p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG, GIF, SVG, MP4
                    </p>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.svg,.mp4"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            <p className="text-sm text-foreground">
              Note: Optional limit (e.g., 6 items for MVP), no NFT minting
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-foreground font-medium">
                Title<span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter portfolio item title"
                required
                className={"mt-2 bg-transparent border-border text-foreground"}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-foreground font-medium"
              >
                Description<span className="text-destructive">*</span>
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your portfolio item"
                rows={6}
                required
                className={"mt-2 bg-transparent border-border text-foreground"}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="tags" className="text-foreground font-medium">
                Tags<span className="text-destructive">*</span>
              </label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter tags separated by commas"
                required
                className={"mt-2 bg-transparent border-border text-foreground"}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-foreground font-medium">
                Category
              </label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Enter category"
                className={"mt-2 bg-transparent border-border text-foreground"}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
            <button
              type="button"
              onClick={handleSkip}
              className="text-foreground hover:text-primary transition-colors order-2 sm:order-1"
            >
              Skip for now
            </button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground px-8 py-2 w-full sm:w-auto order-1 sm:order-2"
            >
              Update Portfolio
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
