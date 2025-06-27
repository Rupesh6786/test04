
"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
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
import { 
    Wrench, 
    PlusCircle, 
    MoreHorizontal, 
    Edit, 
    Trash2, 
    Loader2, 
    Search as SearchIcon,
    ArrowUpDown,
} from "lucide-react";
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
import type { Service } from "@/types";
import { ServiceFormModal } from "@/components/admin/ServiceFormModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AdminServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Inactive">("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Service; direction: 'ascending' | 'descending' } | null>({ key: 'createdAt', direction: 'descending' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const servicesColRef = collection(db, "services");
    const q = query(servicesColRef, orderBy("createdAt", "desc"));

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedServices: Service[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          } as Service;
        });
        setServices(fetchedServices);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching services:", error);
        toast({
          title: "Error Fetching Services",
          description: "Could not fetch services. " + error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [toast]);

  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...services];

    if (statusFilter !== "all") {
        filtered = filtered.filter(service => service.status === statusFilter);
    }
    
    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(service => 
            service.name.toLowerCase().includes(lowerSearch) ||
            service.category.toLowerCase().includes(lowerSearch)
        );
    }

    if (sortConfig !== null) {
        filtered.sort((a, b) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];
            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }

    return filtered;
  }, [services, searchTerm, statusFilter, sortConfig]);

  const requestSort = (key: keyof Service) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof Service) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };
  
  const getStatusBadge = (status: 'Active' | 'Inactive') => {
      return status === 'Active'
        ? 'bg-green-100 text-green-700 border-green-300'
        : 'bg-gray-100 text-gray-700 border-gray-300';
  }

  const handleAddNewService = () => {
    setServiceToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setServiceToEdit(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "services", serviceToDelete.id));
      toast({ title: "Service Deleted" });
      setServiceToDelete(null);
    } catch (error) {
      toast({ title: "Deletion Error", description: "Could not delete service.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Wrench className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Manage Services</h1>
        </div>
        <Button onClick={handleAddNewService} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services List</CardTitle>
          <CardDescription>
            View, filter, and manage all offered services.
          </CardDescription>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
             <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
                />
             </div>
             <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Loading services...</p>
            </div>
          ) : filteredAndSortedServices.length === 0 ? (
             <div className="text-center py-20">
                <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">
                    {searchTerm || statusFilter !== 'all' ? 'No services match filters' : 'No services created yet'}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search.' : "Click 'Add New Service' to start."}
                </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => requestSort('name')} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap">Service Name {getSortIndicator('name')}</TableHead>
                      <TableHead onClick={() => requestSort('category')} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap">Category {getSortIndicator('category')}</TableHead>
                      <TableHead onClick={() => requestSort('status')} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap">Status {getSortIndicator('status')}</TableHead>
                      <TableHead onClick={() => requestSort('price')} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap text-right">Price (₹)</TableHead>
                      <TableHead onClick={() => requestSort('duration')} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap">Duration {getSortIndicator('duration')}</TableHead>
                      <TableHead onClick={() => requestSort('createdAt')} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap">Created Date {getSortIndicator('createdAt')}</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.category}</TableCell>
                        <TableCell>
                           <Badge variant="outline" className={getStatusBadge(service.status)}>
                             {service.status}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right">{service.price ? service.price.toLocaleString() : 'N/A'}</TableCell>
                        <TableCell>{service.duration || 'N/A'}</TableCell>
                        <TableCell>{service.createdAt ? format(service.createdAt as Date, "MMM d, yyyy") : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditService(service)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteService(service)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
                 {filteredAndSortedServices.map((service) => (
                    <Card key={service.id} className="relative">
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg pr-8">{service.name}</CardTitle>
                            <CardDescription>{service.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-muted-foreground">Status</p>
                                <Badge variant="outline" className={`text-xs ${getStatusBadge(service.status)}`}>
                                    {service.status}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-muted-foreground">Price</p>
                                <p className="font-semibold">{service.price ? `₹${service.price.toLocaleString()}` : 'N/A'}</p>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-muted-foreground">Duration</p>
                                <p className="font-semibold">{service.duration || 'N/A'}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-muted-foreground">Created</p>
                                <p className="font-semibold text-xs">{service.createdAt ? format(service.createdAt as Date, "MMM d, yyyy") : 'N/A'}</p>
                            </div>
                        </CardContent>
                        <div className="absolute top-2 right-2">
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditService(service)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteService(service)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                    </Card>
                 ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <ServiceFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onServiceSaved={() => { /* Table updates via onSnapshot */ }}
          serviceToEdit={serviceToEdit}
        />
      )}

      {serviceToDelete && (
        <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete the <strong>"{serviceToDelete.name}"</strong> service.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteService} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete Service
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
