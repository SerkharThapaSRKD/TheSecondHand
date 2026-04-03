import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Check, X, Clock, ShieldCheck, Edit, Users } from "lucide-react";
import { ProductEditDialog } from "@/components/admin/ProductEditDialog";
import { Product } from "@/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const { pendingProducts, approveProduct, rejectProduct, fetchPending, updateProduct } =
    useProducts();
  const navigate = useNavigate();

  const [adminVerified, setAdminVerified] = React.useState<boolean | null>(
    null
  );
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [users, setUsers] = React.useState([]);
  const [loadingUsers, setLoadingUsers] = React.useState(false);

  // Verify admin from API if context is not ready
  React.useEffect(() => {
    if (user?.isAdmin) {
      setAdminVerified(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setAdminVerified(false);
      return;
    }

    fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setAdminVerified(!!data?.user?.isAdmin);
      })
      .catch(() => setAdminVerified(false));
  }, [user]);

  React.useEffect(() => {
    if (user?.isAdmin) {
      fetchPending();
    }
  }, [user, fetchPending]);

  // Fetch all users
  React.useEffect(() => {
    if (!adminVerified) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
    setLoadingUsers(true);

    fetch(`${API_URL}/api/auth/admin/users/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingUsers(false));
  }, [adminVerified]);

  const showAdmin =
    (isAuthenticated && user?.isAdmin) || adminVerified === true;

  /* ❌ BLOCK NON-ADMINS */
  if (!showAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center px-4 py-20">
          <Card className="max-w-md text-center">
            <CardContent className="p-8">
              <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-4 text-2xl font-semibold">
                Admin Access Required
              </h2>
              <p className="mb-6 text-muted-foreground">
                You need admin privileges to access this page.
              </p>
              <Button onClick={() => navigate("/")}>Go Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder-product.png";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_URL}${imageUrl}`;
  };

  const handleEditProduct = async (id: string, data: any) => {
    await updateProduct(id, data);
    setEditingProduct(null);
    fetchPending();
  };

  /* ✅ ADMIN UI */
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage products, users, and transactions
          </p>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products ({pendingProducts.length})</TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users ({users.length})
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            {pendingProducts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center p-12">
                  <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No Pending Reviews</h3>
                  <p className="text-muted-foreground">
                    All products have been reviewed
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingProducts.map((product) => (
                  <Card key={product._id}>
                    <CardContent className="flex gap-4 p-4">
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="h-32 w-32 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.png";
                        }}
                      />

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                by {product.seller.name}
                              </p>
                            </div>
                            <Badge variant="outline">Pending</Badge>
                          </div>

                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>

                          <p className="mt-2 text-sm">
                            <span className="font-semibold text-primary">
                              Rs {product.price}
                            </span>{" "}
                            • {product.size} • {product.gender} • {product.location}
                          </p>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProduct(product)}>
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => approveProduct(product._id)}>
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectProduct(product._id)}>
                            <X className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            {loadingUsers ? (
              <Card>
                <CardContent className="flex flex-col items-center p-12">
                  <p className="text-muted-foreground">Loading users...</p>
                </CardContent>
              </Card>
            ) : users.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center p-12">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No Users Found</h3>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {users.map((u: any) => (
                      <div
                        key={u._id}
                        className="flex items-center justify-between border-b pb-4 last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <Badge variant="outline">
                              Sold: {u.totalSales}
                            </Badge>
                            <Badge variant="outline">
                              Bought: {u.totalPurchases}
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                              Revenue: NRs {u.stats?.totalRevenue || 0}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                              Spent: NRs {u.stats?.totalSpent || 0}
                            </Badge>
                            {u.isAdmin && <Badge className="bg-purple-600">Admin</Badge>}
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate(`/admin/user/${u._id}`)}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {editingProduct && (
          <ProductEditDialog
            product={editingProduct}
            open={!!editingProduct}
            onOpenChange={(open) => !open && setEditingProduct(null)}
            onSave={handleEditProduct}
          />
        )}
      </main>
    </div>
  );
};

export default Admin;
