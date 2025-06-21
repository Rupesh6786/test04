"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Package, PlusCircle, MoreHorizontal, Edit, Trash2, Loader2, Search as SearchIcon } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  query,
  orderBy,
  Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/types";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const productsColRef = collection(db, "products");
    const q = query(productsColRef, orderBy("createdAt", "desc"));

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedProducts: Product[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          } as Product;
        });
        setProducts(fetchedProducts);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching products:", error);
        toast({
          title: "Error Fetching Products",
          description: "Could not fetch products from Firestore. " + error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [toast]);

  const handleAddNewProduct = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "products", productToDelete.id));
      toast({
        title: "Product Deleted",
        description: `${productToDelete.brand} ${productToDelete.model} has been successfully removed.`,
      });
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Deletion Error",
        description: "Could not delete product. " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.brand.toLowerCase().includes(searchLower) ||
      product.model.toLowerCase().includes(searchLower) ||
      (product.category && product.category.toLowerCase().includes(searchLower)) ||
      product.condition.toLowerCase().includes(searchLower)
    );
  });
  
  const getConditionBadge = (condition: 'New' | 'Used') => {
      return condition === 'New' 
        ? 'bg-green-100 text-green-700 border-green-300' 
        : 'bg-yellow-100 text-yellow-700 border-yellow-300';
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Product Inventory</h1>
        </div>
        <Button onClick={handleAddNewProduct} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage AC Units</CardTitle>
          <CardDescription>
            View, add, edit, or delete AC units from your inventory.
          </CardDescription>
          <div className="mt-4 relative">
             <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search (Brand, Model, Category...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
             <div className="text-center py-20">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">
                  {searchTerm ? "No products match search" : "No products in inventory"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm ? "Try different keywords." : "Click 'Add New Product' to start."}
                </p>
             </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Brand & Model</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price (₹)</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Image
                            src={product.imageUrl || "https://placehold.co/60x40.png"}
                            alt={`${product.brand} ${product.model}`}
                            width={60}
                            height={40}
                            className="rounded-md object-cover aspect-[3/2]"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                            <div>{product.brand}</div>
                            <div className="text-xs text-muted-foreground">{product.model}</div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">{product.price.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{product.stock}</TableCell>
                        <TableCell>
                           <Badge variant="outline" className={getConditionBadge(product.condition)}>
                                {product.condition}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditProduct(product)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteProduct(product)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                 {filteredProducts.map((product) => (
                    <Card key={product.id} className="relative">
                        <CardHeader className="flex flex-row items-start gap-4 p-4">
                             <Image
                                src={product.imageUrl || "https://placehold.co/80x60.png"}
                                alt={`${product.brand} ${product.model}`}
                                width={80}
                                height={60}
                                className="rounded-md object-cover aspect-[4/3] border"
                            />
                            <div className="flex-grow">
                                <CardTitle className="text-lg">{product.brand}</CardTitle>
                                <p className="text-sm text-muted-foreground">{product.model}</p>
                                <p className="text-sm text-muted-foreground">{product.category}</p>
                            </div>
                            <div className="absolute top-2 right-2">
                               <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditProduct(product)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteProduct(product)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p className="text-xs text-muted-foreground">Price</p>
                                <p className="font-semibold">₹{product.price.toLocaleString()}</p>
                            </div>
                             <div>
                                <p className="text-xs text-muted-foreground">Stock</p>
                                <p className="font-semibold">{product.stock}</p>
                            </div>
                             <div>
                                <p className="text-xs text-muted-foreground">Condition</p>
                                <Badge variant="outline" className={`text-xs ${getConditionBadge(product.condition)}`}>
                                    {product.condition}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                 ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setProductToEdit(null);
          }}
          onProductSaved={() => { /* Table updates via onSnapshot */ }}
          productToEdit={productToEdit}
        />
      )}

      {productToDelete && (
        <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product:
                <br /> <strong>"{productToDelete.brand} {productToDelete.model}"</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
