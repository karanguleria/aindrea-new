import React, { useState } from "react";
import {
  Plus,
  Calendar,
  CheckCircle,
  FileText,
  Grid3X3,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ImageHeader from "../client/ImageHeader";
import { Input } from "@/components/ui/input";

export default function MyProjects() {
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const tabs = ["All", "Awaiting Upload", "Submitted", "Completed"];

  const assets = [
    {
      id: 1,
      title: "Asset 1",
      tag: "Polygon",
      description:
        "Lorem ipsum dolor sit amet, consectetur lit t amet, consectetur lit.",
      budget: "$2,000.00",
      deliveredDate: "Sep 23, 2025",
      status: "Completed",
    },
    {
      id: 2,
      title: "Asset 2",
      tag: "Ethereum",
      description:
        "Lorem ipsum dolor sit amet, consectetur lit t amet, consectetur lit.",
      budget: "$1,500.00",
      deliveredDate: "Sep 20, 2025",
      status: "Completed",
    },
    {
      id: 3,
      title: "Asset 3",
      tag: "Bitcoin",
      description:
        "Lorem ipsum dolor sit amet, consectetur lit t amet, consectetur lit.",
      budget: "$3,000.00",
      deliveredDate: "Sep 18, 2025",
      status: "Completed",
    },
    {
      id: 4,
      title: "Asset 4",
      tag: "Polygon",
      description:
        "Lorem ipsum dolor sit amet, consectetur lit t amet, consectetur lit.",
      budget: "$2,500.00",
      deliveredDate: "Sep 15, 2025",
      status: "Completed",
    },
    {
      id: 5,
      title: "Asset 5",
      tag: "Ethereum",
      description:
        "Lorem ipsum dolor sit amet, consectetur lit t amet, consectetur lit.",
      budget: "$1,800.00",
      deliveredDate: "Sep 12, 2025",
      status: "Completed",
    },
    {
      id: 6,
      title: "Asset 6",
      tag: "Bitcoin",
      description:
        "Lorem ipsum dolor sit amet, consectetur lit t amet, consectetur lit.",
      budget: "$2,200.00",
      deliveredDate: "Sep 10, 2025",
      status: "Completed",
    },
  ];

  const getTagColor = (tag) => {
    switch (tag) {
      case "Polygon":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Ethereum":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Bitcoin":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <>
      <ImageHeader title="My Projects" buttonText="Hello" />
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <Button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create with Co-Pilot
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="border-border bg-transparent text-foreground px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Calendar className="h-4 w-4" />
                Filter by date
              </Button>
              <Button
                variant="outline"
                className="border-border bg-transparent text-foreground px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <CheckCircle className="h-4 w-4" />
                Filter by Status
              </Button>
              <Button
                variant="outline"
                className="border-border bg-transparent text-foreground px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <FileText className="h-4 w-4" />
                Filter by Content Type
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button
              variant="outline"
              size="icon"
              className="border-border bg-card flex-shrink-0"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4 text-foreground" />
              ) : (
                <Grid3X3 className="h-4 w-4 text-foreground" />
              )}
            </Button>

            <div className="relative flex-1 lg:flex-none lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 bg-transparent border border-border rounded-lg text-foreground"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-foreground text-sm">3 Items</span>
          <div className="flex flex-wrap items-center gap-1 bg-transparent border border-border rounded-lg p-2">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                size="sm"
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        <div
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {assets.map((asset) => (
            <Card
              key={asset.id}
              className="bg-transparent  border-border  transition-colors"
            >
              <CardContent className="p-0">
                <div className="p-4 space-y-4">
                  {/* Image Placeholders */}
                  <div className="flex gap-2">
                    <div className="flex-1 h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                      <div className="text-muted-foreground text-sm">
                        Main Image
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-16 h-16 bg-muted/30 rounded-lg flex items-center justify-center">
                        <div className="text-muted-foreground text-xs">Img</div>
                      </div>
                      <div className="w-16 h-16 bg-muted/30 rounded-lg flex items-center justify-center">
                        <div className="text-muted-foreground text-xs">Img</div>
                      </div>
                    </div>
                  </div>

                  {/* Title and Tag */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-foreground font-semibold text-lg">
                      {asset.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getTagColor(
                        asset.tag
                      )}`}
                    >
                      {asset.tag}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {asset.description}
                  </p>

                  {/* Budget and Date */}
                  <div className="space-y-2">
                    <div className="text-foreground text-sm">
                      <span className="text-muted-foreground">Budget: </span>
                      <span className="font-medium">{asset.budget}</span>
                    </div>
                    <div className="text-foreground text-sm">
                      <span className="text-muted-foreground">Delivered: </span>
                      <span className="font-medium">{asset.deliveredDate}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-border/50 bg-background/50 hover:bg-accent/50 text-foreground"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {[1, 2, 3].map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                className={`w-8 h-8 rounded-md ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <span className="text-muted-foreground px-2">...</span>
            {[67, 68].map((page) => (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-border/50 bg-background/50 hover:bg-accent/50 text-foreground"
            onClick={() => setCurrentPage(Math.min(68, currentPage + 1))}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
