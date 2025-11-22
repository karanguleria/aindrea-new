import { ArrowRightIcon } from "lucide-react";
import React from "react";
import OptimizedImage from "@/components/common/OptimizedImage";

export default function AssetCard({ asset }) {
  return (
    <div className="rounded-2xl p-4 bg-transparent border border-border">
      <div className="overflow-hidden">
        <div className="relative">
          <OptimizedImage
            optimizedUrl={asset.optimizedImage}
            fallbackUrl={asset.image}
            alt={asset.title}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
            {asset.tag}
          </div>
        </div>
        <div className="mt-4 space-y-2.5">
          <h3 className="text-foreground font-semibold text-xl">
            {asset.title}
          </h3>
          <p className="text-foreground/50">Creator: {asset.creator}</p>
          <p className="text-foreground/90 flex items-center text-lg justify-between font-medium">
            <span>Budget:</span>
            <span>{asset.budget}</span>
          </p>
          <p className="text-foreground/90 text-lg flex items-center justify-between">
            <span>License Type:</span>
            <span>{asset.licenseType}</span>
          </p>
          <button className="mt-5 w-full bg-primary hover:bg-primary/80 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <span>View</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
