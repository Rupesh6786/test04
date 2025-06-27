
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
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
    Tag, 
    PlusCircle, 
    Loader2, 
    Pencil, 
    Trash2,
    MoreHorizontal,
    Search,
    ChevronLeft,
    ChevronRight,
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
import type { Offer } from "@/types";
import { OfferFormModal } from "@/components/admin/OfferFormModal";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function AdminOffersPage() {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal and Deletion States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offerToEdit, setOfferToEdit] = useState<Offer | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(null);

  // Filtering and Sorting States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Inactive">("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setIsLoading(true);
    const offersColRef = collection(db, "offers");
    const q = query(offersColRef, orderBy("createdAt", "desc"));

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOffers: Offer[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          } as Offer;
        });
        setOffers(fetchedOffers);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching offers:", error);
        toast({
          title: "Error Fetching Offers",
          description: "Could not fetch offers from Firestore. " + error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [toast]);

  const filteredOffers = useMemo(() => {
    let filtered = [...offers];
    if (statusFilter !== "all") {
        filtered = filtered.filter(offer => offer.status === statusFilter);
    }
    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(offer => 
            offer.title.toLowerCase().includes(lowerSearch) ||
            offer.description.toLowerCase().includes(lowerSearch)
        );
    }
    return filtered;
  }, [offers, searchTerm, statusFilter]);

  const paginatedOffers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredOffers.slice(startIndex, endIndex);
  }, [filteredOffers, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredOffers.length / rowsPerPage);

  const handleAddNewOffer = () => {
    setOfferToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setOfferToEdit(offer);
    setIsModalOpen(true);
  };

  const handleDeleteOffer = (offer: Offer) => {
    setOfferToDelete(offer);
  };
  
  const handleStatusChange = async (offer: Offer, newStatus: 'Active' | 'Inactive') => {
    setUpdatingStatusFor(offer.id);
    try {
        const offerRef = doc(db, 'offers', offer.id);
        await updateDoc(offerRef, { status: newStatus });
        toast({ title: "Status Updated", description: `Offer "${offer.title}" is now ${newStatus}.`});
    } catch (error) {
        console.error("Error updating status:", error);
        toast({ title: "Update Failed", description: "Could not update offer status.", variant: "destructive" });
    } finally {
        setUpdatingStatusFor(null);
    }
  };

  const confirmDeleteOffer = async () => {
    if (!offerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "offers", offerToDelete.id));
      toast({
        title: "Offer Deleted",
        description: `The offer "${offerToDelete.title}" has been successfully removed.`,
      });
      setOfferToDelete(null);
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast({
        title: "Deletion Error",
        description: "Could not delete offer. " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const getStatusBadge = (status: 'Active' | 'Inactive') => {
    return status === 'Active'
      ? 'bg-green-100 text-green-700 border-green-300'
      : 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Tag className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Manage Offers</h1>
        </div>
        <Button onClick={handleAddNewOffer} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Offer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promotional Offers</CardTitle>
          <CardDescription>View, filter, and manage all customer-facing offers.</CardDescription>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
             <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or description..."
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
              <p className="ml-3 text-muted-foreground">Loading offers...</p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <Card className="text-center py-20">
              <CardContent>
                <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'No offers match search' : 'No offers created yet'}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'Try different keywords or filters.' : "Click 'Add New Offer' to start."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead className="min-w-[200px]">Title</TableHead>
                      <TableHead className="min-w-[250px]">Description</TableHead>
                      <TableHead>CTA</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOffers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>
                           <Image
                            src={offer.imageUrl || "https://placehold.co/80x60.png"}
                            alt={offer.title}
                            width={80}
                            height={60}
                            className="rounded-md object-cover aspect-[4/3]"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{offer.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{offer.description}</TableCell>
                        <TableCell>
                          <Link href={offer.ctaLink} passHref legacyBehavior>
                            <a target="_blank" className="text-primary hover:underline text-sm font-medium">{offer.ctaText}</a>
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>Created: {offer.createdAt ? format(offer.createdAt, 'MMM d, yyyy') : 'N/A'}</div>
                          <div>Updated: {offer.updatedAt ? format(offer.updatedAt, 'MMM d, yyyy') : 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                             {updatingStatusFor === offer.id ? <Loader2 className="h-4 w-4 animate-spin"/> : (
                                <Switch
                                  checked={offer.status === 'Active'}
                                  onCheckedChange={(checked) => handleStatusChange(offer, checked ? 'Active' : 'Inactive')}
                                  aria-label="Toggle offer status"
                                />
                             )}
                            <span className="text-sm">{offer.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditOffer(offer)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteOffer(offer)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
                {paginatedOffers.map(offer => (
                    <Card key={offer.id} className="relative">
                        <CardHeader className="p-4">
                            <div className="flex gap-4">
                                {offer.imageUrl && <Image src={offer.imageUrl} alt={offer.title} width={80} height={60} className="rounded-md object-cover aspect-[4/3] border"/>}
                                <div className="flex-grow">
                                    <CardTitle className="text-lg">{offer.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-sm">{offer.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-muted-foreground">Status</span>
                                <Badge variant="outline" className={getStatusBadge(offer.status)}>{offer.status}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-muted-foreground">CTA</span>
                                <Link href={offer.ctaLink} passHref legacyBehavior><a target="_blank" className="text-primary hover:underline">{offer.ctaText}</a></Link>
                            </div>
                             <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>Created: {offer.createdAt ? format(offer.createdAt, 'MMM d, yyyy') : 'N/A'}</span>
                                <span>Updated: {offer.updatedAt ? format(offer.updatedAt, 'MMM d, yyyy') : 'N/A'}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                             <Button variant="outline" size="sm" onClick={() => handleEditOffer(offer)}><Pencil className="mr-2 h-4 w-4"/>Edit</Button>
                             <Button variant="destructive" size="sm" onClick={() => handleDeleteOffer(offer)}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                        </CardFooter>
                    </Card>
                ))}
              </div>

            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="text-sm text-muted-foreground">
              Showing <strong>{paginatedOffers.length}</strong> of <strong>{filteredOffers.length}</strong> offers.
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
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4"/>
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage >= totalPages}>
                  <ChevronRight className="h-4 w-4"/>
              </Button>
           </div>
        </CardFooter>
      </Card>

      {isModalOpen && (
        <OfferFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setOfferToEdit(null);
          }}
          onOfferSaved={() => { /* Table updates via onSnapshot */ }}
          offerToEdit={offerToEdit}
        />
      )}

      {offerToDelete && (
        <AlertDialog open={!!offerToDelete} onOpenChange={(open) => !open && setOfferToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the offer:
                <br /> <strong>"{offerToDelete.title}"</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteOffer}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Offer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

    