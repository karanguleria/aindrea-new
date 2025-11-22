import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Users,
  MapPin,
  Briefcase,
  ExternalLink,
  X,
  Check,
} from "lucide-react";
import apiService from "@/services/api";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";

export default function CreatorSelector({
  selectedCreatorId,
  onSelectCreator,
  onClearSelection,
  disabled = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch creators
  const fetchCreators = useCallback(
    async (search = "", pageNum = 1) => {
      setLoading(true);
      try {
        const response = await apiService.getAvailableCreators({
          search,
          page: pageNum,
          limit: 12,
        });

        if (response.success) {
          setCreators(response.data.creators);
          setTotalPages(response.data.pagination.pages);

          // If a creator is selected, find and set it
          if (selectedCreatorId && !selectedCreator) {
            const creator = response.data.creators.find(
              (c) => c._id === selectedCreatorId
            );
            if (creator) {
              setSelectedCreator(creator);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching creators:", error);
        toast.error("Failed to load creators");
      } finally {
        setLoading(false);
      }
    },
    [selectedCreatorId, selectedCreator]
  );

  // Load selected creator details if ID is provided
  useEffect(() => {
    if (selectedCreatorId && !selectedCreator) {
      fetchCreators("", 1);
    }
  }, [selectedCreatorId, selectedCreator, fetchCreators]);

  // Search effect
  useEffect(() => {
    if (showSelector) {
      fetchCreators(debouncedSearch, 1);
      setPage(1);
    }
  }, [debouncedSearch, showSelector, fetchCreators]);

  const handleCreatorSelect = (creator) => {
    setSelectedCreator(creator);
    setShowSelector(false);
    if (onSelectCreator) {
      onSelectCreator(creator._id);
    }
  };

  const handleClearSelection = () => {
    setSelectedCreator(null);
    setShowSelector(false);
    if (onClearSelection) {
      onClearSelection();
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchCreators(debouncedSearch, newPage);
  };

  return (
    <div className="space-y-4">
      {/* Toggle Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="openToAll"
            name="creatorSelection"
            checked={!showSelector && !selectedCreator}
            onChange={() => {
              setShowSelector(false);
              handleClearSelection();
            }}
            disabled={disabled}
            className="w-4 h-4 text-primary"
          />
          <label
            htmlFor="openToAll"
            className="text-foreground font-medium cursor-pointer"
          >
            Open to All Creators
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="selectCreator"
            name="creatorSelection"
            checked={showSelector || !!selectedCreator}
            onChange={() => {
              setShowSelector(true);
              if (!selectedCreator) {
                fetchCreators("", 1);
              }
            }}
            disabled={disabled}
            className="w-4 h-4 text-primary"
          />
          <label
            htmlFor="selectCreator"
            className="text-foreground font-medium cursor-pointer"
          >
            Select Specific Creator
          </label>
        </div>
      </div>

      {/* Selected Creator Display */}
      {selectedCreator && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {selectedCreator.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {selectedCreator.fullName}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    {selectedCreator.jobTitle && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {selectedCreator.jobTitle}
                      </div>
                    )}
                    {selectedCreator.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedCreator.location}
                      </div>
                    )}
                  </div>
                  {selectedCreator.primaryDiscipline &&
                    selectedCreator.primaryDiscipline.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {selectedCreator.primaryDiscipline.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                disabled={disabled}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Creator Search and Selection */}
      {showSelector && !selectedCreator && (
        <Card className="border-border">
          <CardContent className="p-4 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search creators by name, title, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={disabled}
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading creators...</p>
              </div>
            )}

            {/* Creators Grid */}
            {!loading && creators.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creators.map((creator) => (
                    <Card
                      key={creator._id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedCreatorId === creator._id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border"
                      }`}
                      onClick={() => handleCreatorSelect(creator)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {creator.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-foreground truncate">
                                {creator.fullName}
                              </h4>
                              {selectedCreatorId === creator._id && (
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                            {creator.jobTitle && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {creator.jobTitle}
                              </p>
                            )}
                            {creator.location && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {creator.location}
                              </p>
                            )}
                            {creator.primaryDiscipline &&
                              creator.primaryDiscipline.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {creator.primaryDiscipline.slice(0, 3).map((skill, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                  {creator.primaryDiscipline.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{creator.primaryDiscipline.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            {creator.socialLink && (
                              <a
                                href={creator.socialLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
                              >
                                View Portfolio
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1 || loading}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && creators.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Creators Found
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "No creators available at the moment"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

