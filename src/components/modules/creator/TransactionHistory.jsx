import React, { useState } from "react";
import ImageHeader from "../client/ImageHeader";
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
export default function TransactionHistory() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const transactions = [
    {
      id: 1,
      brief: "Product Launch Video",
      amount: "$1,500.00",
      paidDate: "01/22/2025",
      status: "Minted",
    },
    {
      id: 2,
      brief: "Brand Identity Design",
      amount: "$2,300.00",
      paidDate: "01/22/2025",
      status: "Minted",
    },
    {
      id: 3,
      brief: "Marketing Banner Ad",
      amount: "$750.00",
      paidDate: "01/22/2025",
      status: "Minted",
    },
    {
      id: 4,
      brief: "Website Redesign",
      amount: "$3,200.00",
      paidDate: "01/22/2025",
      status: "Minted",
    },
  ];

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(transactions.map((t) => t.id));
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  return (
    <>
      <ImageHeader title="Transaction History" buttonText="Hello" />
      <div className="border border-border rounded-3xl text-foreground p-4 sm:p-6">
        {/* Platform Snapshot Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Platform Snapshot
              </h1>
              <p className="text-foreground/70 text-base sm:text-lg">
                Track today's key performance metrics at a glance.
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground transition-colors w-full sm:w-auto">
              <Filter className="w-4 h-4 text-foreground" />
              Filter by date
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Earnings Card */}
            <div className="bg-transparent rounded-xl p-6 border border-border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Total Earnings
                  </h3>
                  <p className="text-foreground/70 text-sm">
                    Revenue generated.
                  </p>
                </div>
                <div className="w-12 h-8 bg-transparent border border-border rounded"></div>
              </div>
              <div className="text-2xl font-bold text-foreground">$12,450</div>
            </div>

            {/* Next Payout Card */}
            <div className="bg-transparent rounded-xl p-6 border border-border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Next Payout
                  </h3>
                  <p className="text-foreground/70 text-sm">
                    Scheduled Payment due date
                  </p>
                </div>
                <div className="w-12 h-8 bg-transparent border border-border rounded"></div>
              </div>
              <div className="text-2xl font-bold text-foreground">
                $1,200 on June 5
              </div>
            </div>

            {/* Asset Sales Card */}
            <div className="bg-transparent rounded-xl p-6 border border-border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Asset Sales
                  </h3>
                  <p className="text-foreground/70 text-sm">
                    Tokenized asset income.
                  </p>
                </div>
                <div className="w-12 h-8 bg-transparent border border-border rounded"></div>
              </div>
              <div className="text-2xl font-bold text-foreground">
                8 sold | $3,600
              </div>
            </div>

            {/* Briefs Income Card */}
            <div className="bg-transparent rounded-xl p-6 border border-border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Briefs Income
                  </h3>
                  <p className="text-foreground/70 text-sm">Live on OpenSea</p>
                </div>
                <div className="w-12 h-8 bg-transparent border border-border rounded"></div>
              </div>
              <div className="text-2xl font-bold text-foreground">87</div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-transparent rounded-xl border border-border">
          {/* Table Filters and Search */}
          <div className="p-4 sm:p-6 border-b border-border">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-border rounded-lg text-foreground transition-colors text-sm">
                  <Filter className="w-4 h-4 text-foreground" />
                  Filter by date
                </button>
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-border rounded-lg text-foreground transition-colors text-sm">
                  <Filter className="w-4 h-4 text-foreground" />
                  Filter by Status
                </button>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-foreground/70 text-sm">Select All</span>
                </div>
              </div>
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground" />
                <Input
                  type="text"
                  placeholder="Search"
                  className="pl-10 border-border bg-transparent text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Brief</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Mint Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(transaction.id)}
                      onCheckedChange={() => handleRowSelect(transaction.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.brief}
                  </TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.paidDate}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {transaction.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 py-6">
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
      </div>
    </>
  );
}
