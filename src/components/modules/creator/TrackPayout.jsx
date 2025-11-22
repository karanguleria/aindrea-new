import React, { useState } from "react";
import ImageHeader from "../client/ImageHeader";
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TrackPayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sample data matching the design
  const payoutData = [
    {
      id: 1,
      brief: "Product Launch Video",
      amount: "$1,500.00",
      status: "Paid",
      paidDate: "01/22/2025",
      method: "Stripe",
    },
    {
      id: 2,
      brief: "Brand Identity Design",
      amount: "$2,300.00",
      status: "Pending",
      paidDate: "—",
      method: "Stripe",
    },
    {
      id: 3,
      brief: "Marketing Banner Ad",
      amount: "$750.00",
      status: "Pending",
      paidDate: "—",
      method: "Stripe",
    },
    {
      id: 4,
      brief: "Website Redesign",
      amount: "$3,200.00",
      status: "Pending",
      paidDate: "—",
      method: "Stripe",
    },
  ];

  // Filter data based on search and filters
  const filteredData = payoutData.filter((item) => {
    const matchesSearch = item.brief
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesDate = !dateFilter || item.paidDate.includes(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredData.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (id, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    if (status === "Paid") {
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    } else {
      return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
    }
  };

  return (
    <>
      <ImageHeader title="Track Payout" buttonText="Hello" />
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 border border-border rounded-lg bg-transparent">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setDateFilter(dateFilter === "2025" ? "" : "2025")}
              className={`flex items-center gap-2 text-foreground border-border bg-transparent text-sm ${
                dateFilter === "2025" ? "bg-accent" : ""
              }`}
            >
              <Filter className="w-4 h-4 text-foreground" />
              Filter by date
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setStatusFilter(statusFilter === "Pending" ? "" : "Pending")
              }
              className={`flex items-center gap-2 text-foreground border-border bg-transparent text-sm ${
                statusFilter === "Pending" ? "bg-accent" : ""
              }`}
            >
              <Filter className="w-4 h-4 text-foreground" />
              Filter by Status
            </Button>
          </div>

          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground" />
            <Input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border bg-transparent text-foreground"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border-border border">
          <Table>
            <TableHeader>
              <TableRow className="border-border border-b">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedRows.length === filteredData.length &&
                      filteredData.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-foreground">Brief</TableHead>
                <TableHead className="text-foreground">Amount</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground">Paid Date</TableHead>
                <TableHead className="text-foreground">Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow className="border-border border-b">
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-foreground"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="border-border border-b">
                    <TableCell className="text-foreground ">
                      <Checkbox
                        checked={selectedRows.includes(item.id)}
                        onCheckedChange={(checked) =>
                          handleRowSelect(item.id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {item.brief}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {item.amount}
                    </TableCell>
                    <TableCell className="text-foreground">
                      <span className={getStatusBadge(item.status)}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {item.paidDate}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {item.method}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-border bg-background/50 hover:bg-accent/50 text-foreground"
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
            className="border-border bg-background/50 hover:bg-accent/50 text-foreground"
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
