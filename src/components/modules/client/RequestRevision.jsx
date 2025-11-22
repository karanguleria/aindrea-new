import React, { useState } from "react";
import ImageHeader from "./ImageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Calendar,
  DollarSign,
  FileText,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function RequestRevision() {
  const [creatorNoteExpanded, setCreatorNoteExpanded] = useState(false);
  const [seoExpanded, setSeoExpanded] = useState(false);
  const [browseMoreExpanded, setBrowseMoreExpanded] = useState(false);

  return (
    <>
      <ImageHeader title="Request Revision" buttonText="Close" />
      <div className="text-foreground">
        <div className="p-5  border border-border rounded-lg mb-5">
          <div className="mb-5">
            <h1 className="lg:text-4xl text-2xl font-bold text-foreground mb-2">
              Example Brief Title
            </h1>
            <p className="text-foreground/80 text-lg">
              Creator{" "}
              <span className="text-foreground font-medium">
                [Account Name]
              </span>
            </p>
          </div>
          <div className="mb-2">
            <div className="mb-4">
              <Image
                src="/images/client/request/creator1.png"
                alt="Main image"
                width={1600}
                height={900}
                className="w-full h-auto object-cover rounded-lg shadow-3xl"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {["creator2", "creator3", "creator4", "creator5"].map(
                (imageName, idx) => (
                  <Image
                    key={imageName}
                    src={`/images/client/request/${imageName}.png`}
                    alt={`Thumbnail ${idx + 1}`}
                    width={512}
                    height={512}
                    className="w-full h-auto object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg"
                  />
                )
              )}
            </div>
          </div>
        </div>
        <Card className="bg-transparent border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground font-bold text-xl">
              Brief Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col gap-2">
                <span className="text-lg text-foreground font-medium mb-1">
                  Status:
                </span>
                <div className="flex items-center gap-2 bg-transparent text-foreground px-3 py-2 rounded-lg border-border border hover:bg-accent transition-colors duration-200">
                  <CheckCircle className="h-5 w-5 text-foreground" />
                  <span className="text-sm">Delivered</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-lg text-foreground font-medium mb-1">
                  Deadline:
                </span>
                <div className="flex items-center gap-2 bg-transparent text-foreground px-3 py-2 rounded-lg border-border border hover:bg-accent transition-colors duration-200">
                  <Calendar className="h-5 w-5 text-foreground" />
                  <span className="text-sm ">Sep 23, 2025</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-lg text-foreground font-medium mb-1">
                  Budget:
                </span>
                <div className="flex items-center gap-2 bg-transparent text-foreground px-3 py-2 rounded-lg border-border border hover:bg-accent transition-colors duration-200">
                  <DollarSign className="h-5 w-5 text-foreground" />
                  <span className="text-sm">$2,000.00</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-lg text-foreground font-medium mb-1">
                  License Type:
                </span>
                <div className="flex items-center gap-2 bg-transparent text-foreground px-3 py-2 rounded-lg border-border border hover:bg-accent transition-colors duration-200">
                  <FileText className="h-5 w-5 text-foreground" />
                  <span className="text-sm">Lorem Ipsum</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button className="bg-primary  text-primary-foreground px-8 py-5 text-lg">
                Approve & Release Payment
              </Button>
              <Button
                variant="outline"
                className="border border-border text-foreground bg-transparent px-8 py-5 text-lg"
              >
                Request Revision
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-transparent border-border mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground font-bold text-xl">
              Mood board
            </CardTitle>
            <Download className="h-5 w-5 text-foreground cursor-pointer" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((index) => (
                <Image
                  key={`moodboard-${index}`}
                  src={`/images/client/request/Moodboard${index}.png`}
                  alt={`Mood board ${index}`}
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg"
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card
          className={`bg-transparent mb-8 ${
            creatorNoteExpanded ? "border-primary" : "border-border"
          }`}
        >
          <CardHeader
            className="cursor-pointer"
            onClick={() => setCreatorNoteExpanded(!creatorNoteExpanded)}
          >
            <div className="flex items-center justify-between">
              <CardTitle
                className={`text-xl font-bold ${
                  creatorNoteExpanded ? "text-primary" : "text-foreground"
                }`}
              >
                Creator's Note
              </CardTitle>
              {creatorNoteExpanded ? (
                <ChevronUp className="h-5 w-5 text-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-foreground" />
              )}
            </div>
          </CardHeader>
          {creatorNoteExpanded && (
            <CardContent>
              <p className="text-foreground leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur.
              </p>
            </CardContent>
          )}
        </Card>
        <Card
          className={`bg-transparent mb-8  ${
            seoExpanded ? "border-primary" : "border-border"
          }`}
        >
          <CardHeader
            className="cursor-pointer"
            onClick={() => setSeoExpanded(!seoExpanded)}
          >
            <div className="flex items-center justify-between">
              <CardTitle
                className={`text-xl font-bold ${
                  seoExpanded ? "text-primary" : "text-foreground"
                }`}
              >
                SEO
              </CardTitle>

              {seoExpanded ? (
                <ChevronUp className="h-5 w-5 text-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-foreground" />
              )}
            </div>
          </CardHeader>
          {seoExpanded && (
            <CardContent>
              <div className="space-y-6 px-4">
                <div>
                  <label className="block text-foreground font-medium text-lg mb-3">
                    SEO Title
                  </label>
                  <div className="bg-transparent border border-border rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <button className="px-10 py-0.5 bg-transparent text-foreground border border-border text-sm rounded-lg ">
                        Title
                      </button>
                      <button className="px-10 py-0.5 bg- text-foreground border border-border text-sm rounded-lg ">
                        Page
                      </button>
                      <button className="px-10 py-0.5 bg- text-foreground border border-border text-sm rounded-lg ">
                        Separator
                      </button>
                      <button className="px-10 py-0.5 bg- text-foreground text-sm rounded-lg border border-primary transition-colors">
                        SEO Title
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5">
                    <div className="text-foreground/70 ">0/60 characters</div>
                    <div className="flex items-center gap-2 text-foreground/70 text-sm">
                      <span>Autogenerate with Co-Pilot</span>
                    </div>
                  </div>
                </div>

                {/* Meta Description Section */}
                <div>
                  <label className="block text-foreground font-medium text-lg mb-3">
                    Meta Description
                  </label>
                  <Textarea
                    placeholder="add description"
                    className="w-full h-12 bg-transparent border border-border rounded-lg px-4 py-2.5 text-foreground "
                  />
                  <div className="text-muted-foreground ">0/60 characters</div>
                </div>

                {/* Meta Title Preview Section */}
                <div className="bg-transparent border border-border rounded-lg p-4">
                  <h3 className="text-foreground font-bold mb-3">
                    Meta title preview
                  </h3>
                  <div className="text-foreground/70 text-sm mb-2">
                    http://www.example.com
                  </div>
                  <div className="text-foreground/70 text-sm">
                    Description preview will appear here. When user makes any
                    changes it will be updated live.
                  </div>
                </div>

                {/* Keywords & Density Section */}
                <div>
                  <label className="block text-foreground font-medium text-lg mb-3">
                    Keywords & Density
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="text"
                      placeholder="add keywords"
                      className="flex-1 bg-transparent border border-border rounded-lg px-4 py-3 text-foreground"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    className="border-border text-foreground  px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button className="bg-primary text-primary-foreground px-6 py-2">
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
        <Card
          className={`bg-transparent mb-8 ${
            browseMoreExpanded ? "border-primary" : "border-border"
          }`}
        >
          <CardHeader
            className="cursor-pointer"
            onClick={() => setBrowseMoreExpanded(!browseMoreExpanded)}
          >
            <div className="flex items-center justify-between">
              <CardTitle
                className={`text-xl font-bold ${
                  browseMoreExpanded ? "text-primary" : "text-foreground"
                }`}
              >
                Browse More Briefs
              </CardTitle>
              {browseMoreExpanded ? (
                <ChevronUp className="h-5 w-5 text-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-foreground" />
              )}
            </div>
          </CardHeader>
          {browseMoreExpanded && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* First Brief Card */}
                <div className="p-5 bg-transparent border border-border rounded-lg">
                  <div className="hover:border-primary transition-colors duration-300">
                    <div className="w-full mb-5 overflow-hidden">
                      <Image
                        src="/images/client/request/browse1.png"
                        alt="Thumbnail 1"
                        width={600}
                        height={600}
                        className="w-full h-auto object-cover cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg"
                      />
                    </div>
                    <h3 className="text-foreground font-semibold text-xl mb-3">
                      Example Brief Title
                    </h3>
                    <div className="flex items-center justify-between gap-5 mb-4">
                      <div className="flex-1 bg-accent rounded-full h-2 mr-3">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                      <span className="text-primary text-xs font-medium">
                        In Progress
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-foreground text-md mb-2">
                      <span>Budget:</span>
                      <span className="font-semibold">$2,000.00</span>
                    </div>
                    <div className="flex items-center justify-between text-foreground text-md">
                      <span>Date:</span>
                      <span className="font-semibold">Sep 23, 202</span>
                    </div>
                  </div>
                </div>
                {/* Second Brief Card */}
                <div className="p-5 bg-transparent border border-border rounded-lg">
                  <div className="hover:border-primary transition-colors duration-300">
                    <div className="w-full mb-5 overflow-hidden">
                      <Image
                        src="/images/client/request/browse2.png"
                        alt="Thumbnail 1"
                        width={600}
                        height={600}
                        className="w-full h-auto object-cover cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg"
                      />
                    </div>
                    <h3 className="text-foreground font-semibold text-xl mb-3">
                      Example Brief Title
                    </h3>
                    <div className="flex items-center justify-between gap-5 mb-4">
                      <div className="flex-1 bg-accent rounded-full h-2 mr-3">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: "35%" }}
                        ></div>
                      </div>
                      <span className="text-primary text-xs font-medium">
                        In Progress
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-foreground text-md mb-2">
                      <span>Budget:</span>
                      <span className="font-semibold">$2,000.00</span>
                    </div>
                    <div className="flex items-center justify-between text-foreground text-md">
                      <span>Date:</span>
                      <span className="font-semibold">Sep 23, 202</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-transparent border border-border rounded-lg">
                  <div className="hover:border-primary transition-colors duration-300">
                    <div className=" w-full mb-5 overflow-hidden ">
                      <Image
                        src="/images/client/request/browse3.png"
                        alt="Thumbnail 1"
                        width={600}
                        height={600}
                        className="w-full h-auto object-cover  cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg"
                      />
                    </div>
                    <h3 className="text-foreground font-semibold text-xl mb-3">
                      Example Brief Title
                    </h3>
                    <div className="flex items-center justify-between gap-5 mb-4">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 mr-3">
                        <div
                          className="bg-teal-400 h-2 rounded-full"
                          style={{ width: "65%" }}
                        ></div>
                      </div>
                      <span className="text-teal-400 text-xs font-medium">
                        In Progress
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-foreground text-md mb-2">
                      <h1>Budget:</h1>
                      <h2 className="font-semibold">$2,000.00</h2>
                    </div>
                    <div className="flex items-center justify-between text-foreground text-md">
                      <h1>Date:</h1>
                      <h2 className="font-semibold">Sep 23, 202</h2>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
}
