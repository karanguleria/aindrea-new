import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Share2,
  Heart,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Image from "next/image";
import { useThemeUtils } from "@/hooks/use-theme-utils";

export function ImageGenerationContainer({ images, isLoading }) {
  const [likedImages, setLikedImages] = useState(new Set());
  const { isDark } = useThemeUtils();

  const handleLike = (imageId) => {
    setLikedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleDownload = async (imageUrl, prompt) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-generated-${
        prompt?.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "-") || "image"
      }.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleShare = async (imageUrl, prompt) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Generated Image",
          text: `Check out this AI generated image: ${prompt}`,
          url: imageUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(imageUrl);
    }
  };

  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt);
  };

  if (images.length === 0 && !isLoading) {
    return (
      <div className="px-6 py-6 space-y-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full border border-border bg-transparent flex items-center justify-center text-foreground font-semibold text-sm">
              <Image
                className="flex items-center justify-center"
                src={isDark ? "/images/logo.png" : "/images/logo.svg"}
                alt="logo"
                width={30}
                height={30}
              />
            </div>
            <div className="flex-1">
              <div className="border-border border bg-transparent rounded-2xl p-3">
                <p className="text-foreground text-sm leading-relaxed mb-3">
                  Hi! I'm here to help you generate amazing images with AI.
                  Describe what you want to create and I'll bring your ideas to
                  life.
                </p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• "A futuristic city at sunset"</p>
                  <p>• "A cute cat wearing a space helmet"</p>
                  <p>• "Abstract art with vibrant colors"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-4">
      <div className="max-w-4xl mx-auto">
        {images.map((image) => (
          <div key={image.id} className="flex items-start gap-3 mb-6">
            {!image.isUser && (
              <div className="w-10 h-10 rounded-full border border-border bg-transparent flex items-center justify-center text-foreground font-semibold text-sm">
                <Image
                  className="flex items-center justify-center"
                  src={isDark ? "/images/logo.png" : "/images/logo.svg"}
                  alt="logo"
                  width={30}
                  height={30}
                />
              </div>
            )}

            <div className={`flex-1 ${image.isUser ? "flex justify-end" : ""}`}>
              <div
                className={`max-w-[80%] ${image.isUser ? "text-right" : ""}`}
              >
                {image.isUser ? (
                  <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md">
                    <p className="text-sm">{image.message}</p>
                    <p className="text-xs opacity-70 mt-1">{image.timestamp}</p>
                  </div>
                ) : (
                  <div className="border-border border bg-transparent rounded-2xl p-3">
                    <p className="text-foreground text-sm leading-relaxed mb-3">
                      {image.message}
                    </p>

                    {image.imageUrl ? (
                      <div className="relative group mb-3">
                        <Image
                          src={image.imageUrl}
                          alt="Generated image"
                          width={512}
                          height={512}
                          className="rounded-lg w-full h-auto max-w-md mx-auto"
                        />
                        {/* Image Actions Overlay */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 bg-white/90 hover:bg-white"
                              onClick={() => handleLike(image.id)}
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  likedImages.has(image.id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-600"
                                }`}
                              />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 bg-white/90 hover:bg-white"
                              onClick={() =>
                                handleDownload(image.imageUrl, image.message)
                              }
                            >
                              <Download className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 bg-white/90 hover:bg-white"
                              onClick={() =>
                                handleShare(image.imageUrl, image.message)
                              }
                            >
                              <Share2 className="h-4 w-4 text-gray-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                          ⚠️ Debug: No image URL found. Check console for
                          details.
                        </p>
                        <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                          Image data: {JSON.stringify(image.imageData, null, 2)}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-border pt-1">
                      <p className="text-xs text-muted-foreground">
                        {image.timestamp}
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
                        >
                          <ThumbsDown className="h-3 w-3 mr-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
                          onClick={() => handleCopyPrompt(image.message)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full border border-border bg-transparent flex items-center justify-center text-foreground font-semibold text-sm">
              <Image
                className="flex items-center justify-center"
                src={isDark ? "/images/logo.png" : "/images/logo.svg"}
                alt="logo"
                width={30}
                height={30}
              />
            </div>
            <div className="flex-1">
              <div className="border-border border bg-transparent rounded-2xl p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon"></div>
                  <p className="text-sm text-muted-foreground">
                    Generating your image...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
