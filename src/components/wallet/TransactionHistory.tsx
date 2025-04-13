
import { useState } from "react";
import { Transaction } from "@/types/wallet";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCw, 
  Search,
  PlusCircle,
  MinusCircle
} from "lucide-react";

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading: boolean;
  onRefresh: () => void;
}

const TransactionHistory = ({ transactions, loading, onRefresh }: TransactionHistoryProps) => {
  const [filter, setFilter] = useState<"all" | "deposits" | "payments">("all");
  
  const filteredTransactions = transactions.filter(txn => {
    if (filter === "all") return true;
    if (filter === "deposits") return txn.type === "deposit";
    if (filter === "payments") return txn.type === "payment";
    return true;
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <PlusCircle className="h-4 w-4 text-green-500" />;
      case "payment":
        return <MinusCircle className="h-4 w-4 text-red-500" />;
      case "refund":
        return <ArrowDownCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View all your wallet transactions</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4 gap-2">
          <Button 
            size="sm" 
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button 
            size="sm" 
            variant={filter === "deposits" ? "default" : "outline"}
            onClick={() => setFilter("deposits")}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Deposits
          </Button>
          <Button 
            size="sm" 
            variant={filter === "payments" ? "default" : "outline"}
            onClick={() => setFilter("payments")}
          >
            <MinusCircle className="h-4 w-4 mr-2" />
            Payments
          </Button>
        </div>
        
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="flex items-center gap-2">
                      {renderTransactionIcon(transaction.type)}
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </TableCell>
                    <TableCell className={transaction.type === "payment" ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                      {transaction.type === "payment" ? "-" : "+"}₹{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{transaction.description}</TableCell>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>{renderStatusBadge(transaction.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium">No transactions found</h3>
            <p className="text-gray-500 mt-1">
              {filter !== "all" 
                ? `No ${filter} transactions available.` 
                : "Your transaction history will appear here."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
