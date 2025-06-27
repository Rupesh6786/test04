
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    CalendarDays,
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
import type { Offer } from "@/types";
import { OfferFormModal } from "@/components/admin/OfferFormModal";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminOffersPage() {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offerToEdit, setOfferToEdit] = useState<Offer | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <Card className="text-center py-20">
          <CardContent>
            <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No offers created yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Click 'Add New Offer' to start creating promotions.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="flex flex-col">
              {offer.imageUrl && (
                <Image
                  src={offer.imageUrl}
                  alt={offer.title}
                  width={400}
                  height={200}
                  className="rounded-t-lg object-cover w-full h-40"
                />
              )}
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-xl">{offer.title}</span>
                  <Badge variant="outline" className={getStatusBadge(offer.status)}>{offer.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{offer.description}</CardDescription>
              </CardContent>
              <CardFooter className="flex-col items-start space-y-4">
                 <div className="text-xs text-muted-foreground flex items-center">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5"/>
                    Created: {offer.createdAt ? format(offer.createdAt as Date, 'MMM d, yyyy') : 'N/A'}
                </div>
                <div className="w-full flex justify-between items-center">
                  <Link href={offer.ctaLink} passHref legacyBehavior>
                      <Button asChild variant="outline" size="sm">
                          <a target="_blank">{offer.ctaText}</a>
                      </Button>
                  </Link>
                  <div className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditOffer(offer)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteOffer(offer)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

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
