
"use client";

import { useEffect, useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
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
  CardFooter,
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
  MessageSquare,
  Loader2,
  Trash2,
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  User,
  Clock,
  Check,
  Eye,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Enquiry } from "@/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AdminEnquiriesPage() {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Deletion and Status States
  const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(null);

  // Filtering and Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "New" | "Read">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setIsLoading(true);
    const enquiriesColRef = collection(db, "enquiries");
    const q = query(enquiriesColRef, orderBy("createdAt", "desc"));

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedEnquiries: Enquiry[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          } as Enquiry;
        });
        setEnquiries(fetchedEnquiries);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching enquiries:", error);
        toast({
          title: "Error Fetching Enquiries",
          description: "Could not fetch enquiries. " + error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [toast]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(enquiry => {
        const statusMatch = statusFilter === 'all' || enquiry.status === statusFilter;
        const searchLower = searchTerm.toLowerCase();
        const searchMatch = !searchTerm || 
            enquiry.name.toLowerCase().includes(searchLower) ||
            enquiry.email.toLowerCase().includes(searchLower) ||
            enquiry.subject.toLowerCase().includes(searchLower) ||
            enquiry.message.toLowerCase().includes(searchLower);
        return statusMatch && searchMatch;
    });
  }, [enquiries, searchTerm, statusFilter]);

  const paginatedEnquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredEnquiries.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredEnquiries, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredEnquiries.length / rowsPerPage);
  
  const handleStatusChange = async (enquiry: Enquiry, newStatus: 'New' | 'Read') => {
    if (enquiry.status === newStatus) return;
    setUpdatingStatusFor(enquiry.id);
    try {
        const enquiryRef = doc(db, 'enquiries', enquiry.id);
        await updateDoc(enquiryRef, { status: newStatus });
        toast({ title: "Status Updated", description: `Enquiry marked as ${newStatus}.`});
    } catch (error) {
        toast({ title: "Update Failed", variant: "destructive" });
    } finally {
        setUpdatingStatusFor(null);
    }
  };

  const confirmDelete = async () => {
    if (!enquiryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "enquiries", enquiryToDelete.id));
      toast({ title: "Enquiry Deleted" });
      setEnquiryToDelete(null);
    } catch (error) {
      toast({ title: "Deletion Error", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const getStatusBadge = (status: 'New' | 'Read') => {
    return status === 'New'
      ? 'bg-blue-100 text-blue-700 border-blue-300'
      : 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <MessageSquare className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Customer Enquiries</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contact Form Submissions</CardTitle>
          <CardDescription>View, filter, and manage all incoming enquiries.</CardDescription>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
             <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search enquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
             </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Read">Read</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No enquiries found</h3>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="w-[40%]">Message</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEnquiries.map((enquiry) => (
                      <TableRow key={enquiry.id} data-new={enquiry.status === 'New'}>
                        <TableCell className="font-medium">
                          <div>{enquiry.name}</div>
                          <div className="text-xs text-muted-foreground">{enquiry.email}</div>
                        </TableCell>
                        <TableCell>{enquiry.subject}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-sm">{enquiry.message}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {enquiry.createdAt ? formatDistanceToNow(enquiry.createdAt, { addSuffix: true }) : 'N/A'}
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className={getStatusBadge(enquiry.status)}>{enquiry.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(enquiry, 'Read')} disabled={enquiry.status === 'Read' || updatingStatusFor === enquiry.id}>
                                <Eye className="mr-2 h-4 w-4" /> Mark as Read
                              </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleStatusChange(enquiry, 'New')} disabled={enquiry.status === 'New' || updatingStatusFor === enquiry.id}>
                                <Check className="mr-2 h-4 w-4" /> Mark as New
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEnquiryToDelete(enquiry)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
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
                {paginatedEnquiries.map(enquiry => (
                    <Card key={enquiry.id}>
                        <CardHeader className="p-4 flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-lg">{enquiry.name}</CardTitle>
                                <CardDescription>{enquiry.email}</CardDescription>
                            </div>
                            <Badge variant="outline" className={getStatusBadge(enquiry.status)}>{enquiry.status}</Badge>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                            <div className="font-semibold">{enquiry.subject}</div>
                            <p className="text-sm text-muted-foreground line-clamp-3">{enquiry.message}</p>
                            <div className="text-xs text-muted-foreground pt-2 border-t">
                                <Clock className="inline mr-1 h-3 w-3"/>
                                Received {enquiry.createdAt ? formatDistanceToNow(enquiry.createdAt, { addSuffix: true }) : 'N/A'}
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                             <Button variant="outline" size="sm" onClick={() => handleStatusChange(enquiry, 'Read')} disabled={enquiry.status === 'Read'}>Mark Read</Button>
                             <Button variant="destructive" size="sm" onClick={() => setEnquiryToDelete(enquiry)}>Delete</Button>
                        </CardFooter>
                    </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="text-sm text-muted-foreground">
              Showing <strong>{paginatedEnquiries.length}</strong> of <strong>{filteredEnquiries.length}</strong> enquiries.
           </div>
           <div className="flex items-center space-x-2">
              <Select value={String(rowsPerPage)} onValueChange={(value) => { setRowsPerPage(Number(value)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[80px]"><SelectValue/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                  </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4"/>
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage >= totalPages}>
                  <ChevronRight className="h-4 w-4"/>
              </Button>
           </div>
        </CardFooter>
      </Card>

      {enquiryToDelete && (
        <AlertDialog open={!!enquiryToDelete} onOpenChange={(open) => !open && setEnquiryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone and will permanently delete this enquiry.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
