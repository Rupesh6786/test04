
"use client";

import { useEffect, useState, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingCart,
  Loader2,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  CalendarDays,
  User as UserIcon,
  Package as PackageIcon,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  Timestamp,
  FirestoreError,
  collectionGroup,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Order, User } from "@/types";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface EnrichedOrder extends Order {
  userName?: string;
  userEmail?: string;
  originalUserId: string;
}

const orderStatuses: Order["status"][] = [
  "Placed",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AdminOrdersPage() {
  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();

  const [allOrders, setAllOrders] = useState<EnrichedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof EnrichedOrder, direction: 'ascending' | 'descending' } | null>(null);
  const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(null);
  
  const truncateText = (text?: string, length: number = 20): string => {
    if (!text) return 'N/A';
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const usersCollectionRef = collection(db, "users");
    getDocs(usersCollectionRef).then(usersSnapshot => {
        const usersMap = new Map<string, User>();
        usersSnapshot.forEach(userDoc => {
            usersMap.set(userDoc.id, { uid: userDoc.id, ...userDoc.data() } as User);
        });

        const ordersQuery = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(orderDoc => {
                const orderData = orderDoc.data() as Order;
                const user = usersMap.get(orderData.userId);

                return {
                    ...orderData,
                    id: orderDoc.id,
                    userName: user?.displayName || 'N/A',
                    userEmail: user?.email || 'N/A',
                    originalUserId: orderData.userId,
                    createdAt: orderData.createdAt instanceof Timestamp ? orderData.createdAt.toDate() : new Date(orderData.createdAt as any),
                } as EnrichedOrder;
            });
            
            setAllOrders(fetchedOrders);
            setIsLoading(false);
        }, (error: FirestoreError) => {
            console.error("Real-time order fetch error:", error);
            toast({
                title: "Real-time Fetch Error",
                description: "Could not listen for order updates. Check Firestore rules for collection group 'orders'.",
                variant: "destructive",
            });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }).catch((error: FirestoreError) => {
        console.error("Error fetching users for order list:", error);
        toast({ title: "User Data Error", description: `Could not load user data for orders: ${error.message}`, variant: "destructive" });
        setIsLoading(false);
    });
  }, [currentUser, isAdmin, toast]);


  const handleUpdateStatus = async (
    originalUserId: string,
    orderId: string,
    newStatus: Order["status"]
  ) => {
    setUpdatingStatusFor(orderId);
    try {
      const orderRef = doc(db, "users", originalUserId, "orders", orderId);
      
      const updateData: { status: Order['status'], shippedDate?: any, deliveredDate?: any } = { status: newStatus };
      if (newStatus === 'Shipped') {
        updateData.shippedDate = serverTimestamp();
      } else if (newStatus === 'Delivered') {
        updateData.deliveredDate = serverTimestamp();
      }
      
      await updateDoc(orderRef, updateData);
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({ title: "Update Failed", description: "Could not update order status.", variant: "destructive" });
    } finally {
      setUpdatingStatusFor(null);
    }
  };
  
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Placed': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Shipped': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-300';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...allOrders];

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.userName?.toLowerCase().includes(lowerSearchTerm) ||
          order.userEmail?.toLowerCase().includes(lowerSearchTerm) ||
          order.productDetails.brand.toLowerCase().includes(lowerSearchTerm) ||
          order.productDetails.model.toLowerCase().includes(lowerSearchTerm) ||
          order.id.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
          const valA = a[sortConfig.key];
          const valB = b[sortConfig.key];
          
          if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
      });
    }
    return filtered;
  }, [allOrders, statusFilter, searchTerm, sortConfig]);

  const requestSort = (key: keyof EnrichedOrder) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  const getSortIndicator = (key: keyof EnrichedOrder) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  if (!isLoading && !isAdmin && !currentUser?.uid) {
    return <div className="p-4 text-destructive">Access Denied.</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Manage Orders</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Product Orders</CardTitle>
          <CardDescription>View, filter, sort, and manage all customer product orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search (User, Product, Order ID)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            {isLoading && !allOrders.length ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading orders...</p>
              </div>
            ) : !filteredAndSortedOrders.length && !isLoading ? (
              <div className="text-center py-10">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No orders found</h3>
                <p className="mt-1 text-sm text-muted-foreground">No orders match your filters.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead onClick={() => requestSort('userName')} className="cursor-pointer hover:bg-muted/50 min-w-[200px]">Customer {getSortIndicator('userName')}</TableHead>
                        <TableHead className="min-w-[200px]">Product</TableHead>
                        <TableHead onClick={() => requestSort('createdAt')} className="cursor-pointer hover:bg-muted/50">Date Placed {getSortIndicator('createdAt')}</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Total Paid</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedOrders.map((order) => (
                        <TableRow key={order.id + order.originalUserId}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground shrink-0"/>
                              <div>
                                <div>{order.userName || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{truncateText(order.userEmail)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                             <div className="flex items-center gap-2">
                               <Image src={order.productDetails.imageUrl || "https://placehold.co/40x30.png"} alt={order.productDetails.brand} width={40} height={30} className="rounded-sm object-cover" />
                               <div>
                                 <div>{order.productDetails.brand} {order.productDetails.model}</div>
                                 <div className="text-xs text-muted-foreground">ID: {truncateText(order.id, 10)}</div>
                               </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.createdAt ? format(order.createdAt as Date, "MMM d, yyyy") : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right font-medium">₹{((order.paymentMethod === 'COD' ? order.productDetails.price : order.pricePaid) / 100).toFixed(2)}</TableCell>
                          <TableCell>{order.paymentMethod}</TableCell>
                          <TableCell>
                             <Badge variant="outline" className={`border ${getStatusColor(order.status)}`}>{order.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={updatingStatusFor === order.id}>
                                  {updatingStatusFor === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {orderStatuses.map(status => (
                                  <DropdownMenuItem key={status} onClick={() => handleUpdateStatus(order.originalUserId, order.id, status)} disabled={order.status === status || updatingStatusFor === order.id}>
                                    Mark as {status}
                                  </DropdownMenuItem>
                                ))}
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
                  {filteredAndSortedOrders.map((order) => (
                    <Card key={order.id + order.originalUserId}>
                       <CardHeader className="p-4 pb-2 flex-row justify-between items-start">
                          <div>
                            <CardTitle className="text-lg mb-1">{order.userName}</CardTitle>
                            <CardDescription>{truncateText(order.userEmail)}</CardDescription>
                            <CardDescription className="text-xs">ID: {truncateText(order.id, 15)}</CardDescription>
                          </div>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" disabled={updatingStatusFor === order.id}>{updatingStatusFor === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}</Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">{orderStatuses.map(status => <DropdownMenuItem key={status} onClick={() => handleUpdateStatus(order.originalUserId, order.id, status)} disabled={order.status === status || updatingStatusFor === order.id}>Mark as {status}</DropdownMenuItem>)}</DropdownMenuContent>
                            </DropdownMenu>
                       </CardHeader>
                       <CardContent className="p-4 pt-2 space-y-4">
                           <div className="flex justify-between items-center border-b pb-3">
                              <span className="font-semibold text-muted-foreground">Status</span>
                              <Badge variant="outline" className={getStatusColor(order.status)}>{order.status}</Badge>
                           </div>
                           <div className="flex gap-4 items-center">
                               <Image src={order.productDetails.imageUrl || "https://placehold.co/60x45.png"} alt={order.productDetails.brand} width={60} height={45} className="rounded-md border"/>
                               <div>
                                   <p className="font-semibold">{order.productDetails.brand} {order.productDetails.model}</p>
                                   <p className="text-sm">Total: <span className="font-medium">₹{((order.paymentMethod === 'COD' ? order.productDetails.price : order.pricePaid) / 100).toFixed(2)}</span> ({order.paymentMethod})</p>
                                   <p className="text-xs text-muted-foreground">Placed: {order.createdAt ? format(order.createdAt as Date, "MMM d, yyyy") : 'N/A'}</p>
                               </div>
                           </div>
                       </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

