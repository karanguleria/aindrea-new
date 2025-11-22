import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ImageHeader from "../client/ImageHeader";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/userContext";

export default function Dashboard() {
  const { user, loading } = useAuth();

  return (
    <div className="">
      <ImageHeader
        title={"Dashboard"}
        buttonText={
          loading ? "..." : user?.name || user?.accountName || "Creator"
        }
      />
      <div className="space-y-6 sm:space-y-8 border border-border rounded-3xl p-4 sm:p-6 min-h-screen">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Platform Snapshot
            </h1>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-foreground w-full sm:w-auto"
            >
              Filter by date
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </div>
          <p className="text-foreground text-base sm:text-lg">
            Track today's key performance metrics at a glance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Views",
                sublabel: "Times asset appeared",
                value: "2,340",
              },
              { label: "Downloads", sublabel: "Total downloads", value: "540" },
              { label: "Earnings", sublabel: "Total revenue", value: "$1,280" },
              {
                label: "Engagement",
                sublabel: "Interaction rate",
                value: "23%",
              },
            ].map((metric, index) => (
              <Card key={index} className="border bg-transparent border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-foreground font-bold">
                        {metric.label}
                      </p>
                      <p className="text-xs font-semibold text-foreground/70">
                        {metric.sublabel}
                      </p>
                      <p className="text-3xl font-extrabold text-foreground">
                        {metric.value}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            New Brief
          </h2>

          <Card className="bg-transparent  border-border">
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                      Evolving Creators: A Dynamic NFT Collection
                    </h3>
                    <p className="text-foreground/80 text-sm sm:text-base">
                      Client: {loading ? "..." : user?.fullName}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </Button>
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-transparent">
                  <div className="space-y-4">
                    <div className="w-12 h-12 mx-auto  flex items-center justify-center">
                      <svg
                        className="w-10 h-10"
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
                      <p className="text-lg font-medium text-foreground">
                        Drag and drop media
                      </p>
                      <p className="text-foreground/60">
                        <span className="text-primary cursor-pointer hover:underline">
                          Browse files
                        </span>
                      </p>
                      <p className="text-sm text-foreground/70">
                        Max size: 50MB
                      </p>
                      <p className="text-sm text-foreground/80">
                        JPG, PNG, GIF, SVG, MP4
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Brief Details
          </h2>

          <Card className="bg-transparent border-border">
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-foreground/70 mb-2">Status</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Awaiting Upload
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70 mb-2">Deadline</p>
                    <p className="text-foreground font-medium">Sep 23, 2025</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70 mb-2">Budget</p>
                    <p className="text-foreground font-medium">$2,000.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70 mb-2">Tags</p>
                    <p className="text-foreground font-medium">
                      #DynamicNFT #AnimatedPortraits #Futurism
                      #CyberpunkAesthetic
                    </p>
                  </div>
                </div>

                <Button className="bg-primary  text-primary-foreground px-4 py-2 rounded-lg">
                  View More Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Portfolio
          </h2>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-foreground text-sm"
              >
                Filter by date
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-foreground text-sm"
              >
                Filter by Tag
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground" />
                <Input
                  type="text"
                  placeholder="Search"
                  className="pl-10 border-border bg-transparent text-foreground"
                />
              </div>
              <Button className="bg-primary text-primary-foreground w-full sm:w-auto">
                <Plus />
                New Upload
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="bg-transparent border-border">
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-24 bg-muted rounded"></div>
                      <div className="h-24 bg-muted rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">
                        Portfolio title
                      </h3>
                      <p className="text-sm text-foreground/70">Sep 23, 2025</p>
                      <p className="text-sm text-foreground/80">
                        Lorem ipsum dolor sit amet, consectetur lit t amet,
                        consectetur Lit.
                      </p>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          #digitalart
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          #digitalart
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="bg-transparent  border-border border-dashed">
              <CardContent className="text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-card border border-border rounded-lg flex items-center justify-center">
                    <Plus />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Showcase Your Next Creation
                    </h3>
                    <p className="text-sm text-foreground/70">
                      Upload your work and let the world see what you can do.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
