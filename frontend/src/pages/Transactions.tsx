import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Transaction {
  _id: string;
  type: "sale" | "purchase";
  product: {
    name: string;
    price: number;
    images: string[];
  };
  seller?: {
    _id: string;
    name: string;
    email: string;
  };
  buyer?: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionStatus: string;
  createdAt: string;
}

interface Stats {
  totalSales?: number;
  totalRevenue?: number;
  totalPurchases?: number;
  totalSpent?: number;
  transactions: Transaction[];
}

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Transactions() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [salesStats, setSalesStats] = useState<Stats | null>(null);
  const [purchaseStats, setPurchaseStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchTransactions();
  }, [isAuthenticated]);

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    try {
      // Fetch all transactions
      const allRes = await fetch(`${API}/api/transactions/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (allRes.ok) {
        const allData = await allRes.json();
        setAllTransactions(allData.transactions || []);
      }

      // Fetch sales data
      const salesRes = await fetch(`${API}/api/transactions/user/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSalesStats(salesData);
      }

      // Fetch purchases data
      const purchaseRes = await fetch(`${API}/api/transactions/user/purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (purchaseRes.ok) {
        const purchaseData = await purchaseRes.json();
        setPurchaseStats(purchaseData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (data: Transaction[], filename: string) => {
    const headers = ["Date", "Type", "Product", "Amount", "Other Party", "Status"];
    const rows = data.map((t) => [
      new Date(t.createdAt).toLocaleDateString(),
      t.type === "sale" ? "Sold" : "Purchased",
      t.product.name,
      `Rs ${t.amount}`,
      t.type === "sale" ? t.buyer?.name : t.seller?.name,
      t.paymentStatus,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading transactions...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const sales = salesStats?.transactions || [];
  const purchases = purchaseStats?.transactions || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent text-muted-foreground hover:text-primary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">View all your buying and selling transactions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Items Sold</p>
                  <p className="text-2xl font-bold">{salesStats?.totalSales || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">Rs {(salesStats?.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Items Purchased</p>
                  <p className="text-2xl font-bold">{purchaseStats?.totalPurchases || 0}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">Rs {(purchaseStats?.totalSpent || 0).toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All Transactions ({allTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="sales">
              Sales ({sales.length})
            </TabsTrigger>
            <TabsTrigger value="purchases">
              Purchases ({purchases.length})
            </TabsTrigger>
          </TabsList>

          {/* All Transactions */}
          <TabsContent value="all" className="space-y-4">
            {allTransactions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No transactions yet</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => downloadCSV(allTransactions, "all_transactions.csv")}
                  >
                    <Download className="w-4 h-4" /> Download CSV
                  </Button>
                </div>
                <div className="space-y-4">
                  {allTransactions.map((transaction) => (
                    <Card key={transaction._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            <img
                              src={transaction.product.images?.[0] || "/placeholder.png"}
                              alt={transaction.product.name}
                              className="h-16 w-16 rounded object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{transaction.product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {transaction.type === "sale"
                                  ? `Sold to: ${transaction.buyer?.name}`
                                  : `Bought from: ${transaction.seller?.name}`}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(transaction.createdAt).toLocaleDateString()} -{" "}
                                {new Date(transaction.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className={`text-lg font-bold ${transaction.type === "sale" ? "text-green-600" : "text-blue-600"}`}>
                              {transaction.type === "sale" ? "+" : "-"} Rs {transaction.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            {sales.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">You haven't sold any items yet</p>
                  <Button className="mt-4" onClick={() => navigate("/sell")}>
                    Start Selling
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => downloadCSV(sales, "sales_transactions.csv")}
                  >
                    <Download className="w-4 h-4" /> Download CSV
                  </Button>
                </div>
                <div className="space-y-4">
                  {sales.map((transaction) => (
                    <Card key={transaction._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            <img
                              src={transaction.product.images?.[0] || "/placeholder.png"}
                              alt={transaction.product.name}
                              className="h-16 w-16 rounded object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{transaction.product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Sold to: <strong>{transaction.buyer?.name}</strong>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              + Rs {transaction.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-4">
            {purchases.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">You haven't purchased any items yet</p>
                  <Button className="mt-4" onClick={() => navigate("/search")}>
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => downloadCSV(purchases, "purchase_transactions.csv")}
                  >
                    <Download className="w-4 h-4" /> Download CSV
                  </Button>
                </div>
                <div className="space-y-4">
                  {purchases.map((transaction) => (
                    <Card key={transaction._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            <img
                              src={transaction.product.images?.[0] || "/placeholder.png"}
                              alt={transaction.product.name}
                              className="h-16 w-16 rounded object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{transaction.product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Bought from: <strong>{transaction.seller?.name}</strong>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">
                              - Rs {transaction.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
