import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Briefcase,
  ExternalLink,
  Star,
  User,
} from "lucide-react";

/**
 * BidderProfileCard Component
 * 
 * Displays a bidder's profile information including name, job title, location,
 * primary disciplines, and portfolio links.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.bidder - Bidder user object with profile information
 * @param {Object} props.bid - Bid object containing bidder information and portfolio links
 * @param {Function} props.onViewProfile - Callback function when "View Profile" is clicked
 * @returns {JSX.Element} Bidder profile card component
 */
const BidderProfileCard = memo(function BidderProfileCard({ bidder, bid, onViewProfile }) {
  // Get bidder info from bid or bidder prop
  const bidderName = bidder?.fullName || bid?.bidderName || "Unknown";
  const jobTitle = bidder?.jobTitle || "";
  const location = bidder?.location || "";
  const primaryDiscipline =
    bidder?.primaryDiscipline || bidder?.primaryDisciplines || [];
  const socialLink = bidder?.socialLink || "";

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {getInitials(bidderName)}
            </AvatarFallback>
          </Avatar>

          {/* Bidder Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-foreground text-lg truncate">
                  {bidderName}
                </h4>
                {jobTitle && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Briefcase className="h-3 w-3" />
                    {jobTitle}
                  </p>
                )}
                {location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {location}
                  </p>
                )}
              </div>
            </div>

            {/* Primary Disciplines */}
            {primaryDiscipline.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {primaryDiscipline.slice(0, 3).map((skill, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
                {primaryDiscipline.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{primaryDiscipline.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Portfolio Links */}
            {bid?.portfolioLinks && bid.portfolioLinks.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Portfolio Links:
                </p>
                <div className="flex flex-wrap gap-1">
                  {bid.portfolioLinks.slice(0, 2).map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3 inline mr-1" />
                      Portfolio {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* View Profile Button */}
            {onViewProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile(bidder?._id || bid?.bidderId);
                }}
                className="w-full mt-2"
              >
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            )}
          </div>
        </div>
  );
});

export default BidderProfileCard;

