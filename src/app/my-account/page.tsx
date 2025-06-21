
"use client"; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { useAuth } from "@/contexts/AuthContext";
import { Building2, ListChecks, UserCircle, LogOut, Loader2, PlusCircle, Pencil, Trash2, Home, Briefcase, MapPin, CalendarDays, Clock, CreditCard, Save, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { Address, Appointment } from "@/types";
import { db, auth } from "@/lib/firebase";
import { collection, query, onSnapshot, Unsubscribe, doc, deleteDoc, updateDoc, orderBy, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
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
import { AddressFormModal } from "@/components/AddressFormModal";
import { format, parseISO } from 'date-fns';
import type {} from '@/types/razorpay';

const RAZORPAY_KEY_ID = "rzp_test_lw1YZ20Ss4PtqR";
const APPOINTMENT_FIXED_PAY_AMOUNT = 50000; // Example: 500.00 INR in paise

export default function MyAccountPage() {
  const { currentUser, isLoggedIn, loading, logout, openAuthModal } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isRazorpayScriptLoaded, setIsRazorpayScriptLoaded] = useState(false);
  const [processingPaymentForAppointmentId, setProcessingPaymentForAppointmentId] = useState<string | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(currentUser?.displayName || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      openAuthModal();
      router.push('/'); 
    }
  }, [isLoggedIn, loading, openAuthModal, router]);

  useEffect(() => {
    if (currentUser) {
        setNewDisplayName(currentUser.displayName || "");
    }
  }, [currentUser]);

  useEffect(() => {
    const scriptId = 'razorpay-checkout-script-myaccount';
    if (document.getElementById(scriptId)) {
      setIsRazorpayScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsRazorpayScriptLoaded(true);
    script.onerror = () => {
      toast({ title: "Error", description: "Could not load payment gateway script.", variant: "destructive"});
      setIsRazorpayScriptLoaded(false);
    }
    document.body.appendChild(script);
    return () => {
       const existingScript = document.getElementById(scriptId);
      if (existingScript && existingScript.parentNode === document.body) {
        document.body.removeChild(existingScript);
      }
    };
  }, [toast]);
  
  useEffect(() => {
    let unsubscribeAppointments: Unsubscribe | undefined;
    if (isLoggedIn && currentUser) {
      setIsLoadingAppointments(true);
      const appointmentsCol = collection(db, "users", currentUser.uid, "appointments");
      const q = query(appointmentsCol, orderBy("createdAt", "desc"));

      unsubscribeAppointments = onSnapshot(q, (querySnapshot) => {
        const fetchedAppointments: Appointment[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedAppointments.push({ id: docSnap.id, ...docSnap.data() } as Appointment);
        });
        setAppointments(fetchedAppointments);
        setIsLoadingAppointments(false);
      }, (error) => {
        console.error("Error fetching appointments: ", error);
        toast({ title: "Error", description: "Could not fetch appointments.", variant: "destructive" });
        setIsLoadingAppointments(false);
      });
    } else {
      setAppointments([]);
      setIsLoadingAppointments(false);
    }
    return () => {
      if (unsubscribeAppointments) unsubscribeAppointments();
    };
  }, [currentUser, isLoggedIn, toast]);

  useEffect(() => {
    let unsubscribeAddresses: Unsubscribe | undefined;
    if (isLoggedIn && currentUser) {
      setIsLoadingAddresses(true);
      const addressesCol = collection(db, "users", currentUser.uid, "addresses");
      const q = query(addressesCol); 

      unsubscribeAddresses = onSnapshot(q, (querySnapshot) => {
        const fetchedAddresses: Address[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedAddresses.push({ id: docSnap.id, ...docSnap.data() } as Address);
        });
        setAddresses(fetchedAddresses);
        setIsLoadingAddresses(false);
      }, (error) => {
        console.error("Error fetching addresses in real-time: ", error);
        toast({ title: "Error", description: "Could not fetch addresses.", variant: "destructive" });
        setIsLoadingAddresses(false);
      });
    } else {
      setAddresses([]);
      setIsLoadingAddresses(false);
    }
    return () => {
      if (unsubscribeAddresses) unsubscribeAddresses();
    };
  }, [currentUser, isLoggedIn, toast]);

  const handlePayForAppointment = useCallback(async (appointment: Appointment) => {
    if (!isLoggedIn || !currentUser) {
      toast({ title: "Login Required", description: "Please log in to proceed.", variant: "destructive" });
      openAuthModal();
      return;
    }
    if (!isRazorpayScriptLoaded) {
        toast({ title: "Payment Gateway Loading", description: "Please wait for the payment gateway.", variant: "destructive"});
        return;
    }
    if (RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID" || !RAZORPAY_KEY_ID) {
      toast({ title: "Configuration Error", description: "Razorpay Key ID not configured.", variant: "destructive" });
      return;
    }

    setProcessingPaymentForAppointmentId(appointment.id);

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: APPOINTMENT_FIXED_PAY_AMOUNT,
      currency: "INR",
      name: "Classic-Solution Service",
      description: `Payment for ${appointment.serviceType}`,
      handler: async (response) => {
        try {
          const appointmentRef = doc(db, "users", currentUser.uid, "appointments", appointment.id);
          await updateDoc(appointmentRef, {
            status: "Confirmed",
            paymentId: response.razorpay_payment_id,
            pricePaid: APPOINTMENT_FIXED_PAY_AMOUNT
          });
          toast({
            title: "Payment Successful!",
            description: `Appointment for ${appointment.serviceType} confirmed. Payment ID: ${response.razorpay_payment_id}.`,
          });
        } catch (error) {
            console.error("Error updating appointment status:", error);
            toast({ title: "Update Error", description: "Payment successful, but failed to update appointment status. Please contact support.", variant: "destructive" });
        } finally {
            setProcessingPaymentForAppointmentId(null);
        }
      },
      prefill: {
        name: currentUser.displayName || appointment.name,
        email: currentUser.email || appointment.email,
        contact: appointment.phone
      },
      notes: {
        appointmentId: appointment.id,
        userId: currentUser.uid,
        serviceType: appointment.serviceType,
      },
      theme: {
        color: "#2563EB", 
      },
      modal: {
        ondismiss: () => {
          toast({ title: "Payment Canceled", description: "Payment process was canceled.", variant: "destructive"});
          setProcessingPaymentForAppointmentId(null);
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.error("Razorpay Payment Failed for appointment:", response);
        toast({
          title: "Payment Failed",
          description: `${response.error.description || 'An unknown error occurred.'} (Code: ${response.error.code})`,
          variant: "destructive",
        });
        setProcessingPaymentForAppointmentId(null);
      });
      rzp.open();
    } catch (error) {
        console.error("Error initializing Razorpay for appointment: ", error);
        toast({ title: "Payment Error", description: "Could not initialize payment gateway.", variant: "destructive" });
        setProcessingPaymentForAppointmentId(null);
    }
  }, [isLoggedIn, currentUser, toast, openAuthModal, isRazorpayScriptLoaded]);


  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading account details...</p>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-4">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-6">Please log in to access your account details.</p>
        <Button onClick={() => openAuthModal()}>Login / Register</Button>
      </div>
    );
  }
  
  const handleSaveProfile = async () => {
    if (!currentUser || !auth.currentUser) {
        toast({ title: "Error", description: "User not found.", variant: "destructive"});
        return;
    }
    if (!newDisplayName || newDisplayName.trim().length < 2) {
        toast({ title: "Invalid Name", description: "Display name must be at least 2 characters.", variant: "destructive"});
        return;
    }

    setIsSavingProfile(true);
    try {
        // Update Firebase Auth profile
        await updateProfile(auth.currentUser, { displayName: newDisplayName.trim() });

        // Update Firestore user document
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { displayName: newDisplayName.trim() });

        toast({ title: "Profile Updated", description: "Your display name has been updated." });
        setIsEditingProfile(false);
    } catch (error) {
        console.error("Error updating profile:", error);
        toast({ title: "Update Failed", description: "Could not update your profile. Please try again.", variant: "destructive"});
    } finally {
        setIsSavingProfile(false);
    }
  };


  const handleAddNewAddress = () => {
     setIsAddAddressModalOpen(true);
  };

  const handleEditAddress = (addressId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `Editing address ${addressId} will be available soon.`,
    });
  };

  const handleDeleteAddress = (address: Address) => {
    setAddressToDelete(address);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete || !currentUser) return;
    setIsDeletingAddress(true);
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "addresses", addressToDelete.id));
      toast({ title: "Address Deleted", description: "The address has been successfully removed." });
    } catch (error) {
      console.error("Error deleting address: ", error);
      toast({ title: "Error", description: "Could not delete address.", variant: "destructive" });
    } finally {
      setIsDeletingAddress(false);
      setShowDeleteConfirm(false);
      setAddressToDelete(null);
    }
  };

  const getAddressIcon = (type: Address['type']) => {
    switch (type) {
      case 'Home': return <Home className="w-5 h-5 text-primary mr-2 shrink-0" />;
      case 'Work': return <Briefcase className="w-5 h-5 text-primary mr-2 shrink-0" />;
      default: return <MapPin className="w-5 h-5 text-primary mr-2 shrink-0" />;
    }
  };

  const handleAddressAdded = () => {
    setIsAddAddressModalOpen(false);
    toast({ title: "Address Added", description: "New address successfully saved." });
  };
  
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-700';
      case 'Payment Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-4 md:mb-0">My Account</h1>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><UserCircle className="mr-2 h-6 w-6 text-primary" /> Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditingProfile ? (
                <div className="space-y-3">
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-muted-foreground mb-1">Display Name</label>
                        <Input 
                            id="displayName"
                            type="text"
                            value={newDisplayName}
                            onChange={(e) => setNewDisplayName(e.target.value)}
                            placeholder="Your Name"
                            disabled={isSavingProfile}
                        />
                    </div>
                    <p className="text-sm"><strong>Email:</strong> {currentUser.email} (cannot be changed)</p>
                    <div className="flex space-x-2 mt-2">
                        <Button onClick={handleSaveProfile} disabled={isSavingProfile} size="sm">
                            {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                            Save
                        </Button>
                        <Button variant="outline" onClick={() => { setIsEditingProfile(false); setNewDisplayName(currentUser.displayName || ""); }} disabled={isSavingProfile} size="sm">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <p><strong>Name:</strong> {currentUser.displayName || "N/A"}</p>
                    <p><strong>Email:</strong> {currentUser.email}</p>
                    <Button variant="link" className="p-0 h-auto" onClick={() => setIsEditingProfile(true)}>
                        <Pencil className="mr-1 h-3 w-3" /> Edit Profile
                    </Button>
                </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center"><ListChecks className="mr-2 h-6 w-6 text-primary" /> My Appointments</CardTitle>
            <CardDescription>View and manage your scheduled services.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments && (
                 <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading appointments...</p>
                </div>
            )}
            {!isLoadingAppointments && appointments.length === 0 && (
              <p className="text-muted-foreground">You have no upcoming appointments.</p>
            )}
            {!isLoadingAppointments && appointments.length > 0 && (
              <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {appointments.map(app => (
                  <li key={app.id} className="p-4 border rounded-md bg-background hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{app.serviceType}</h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                            <CalendarDays className="w-3.5 h-3.5 mr-1.5 shrink-0"/> 
                            {format(parseISO(app.bookingDate), "PPP")} 
                            <Clock className="w-3.5 h-3.5 ml-2 mr-1.5 shrink-0"/> 
                            {app.bookingTime}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1"><strong>Address:</strong> {app.address}</p>
                     {app.pricePaid && <p className="text-sm text-muted-foreground mb-1"><strong>Amount Paid:</strong> ₹{(app.pricePaid / 100).toFixed(2)}</p>}
                    {app.paymentId && <p className="text-sm text-muted-foreground mb-3"><strong>Payment ID:</strong> {app.paymentId}</p>}
                    
                    {app.status === 'Payment Pending' && (
                        <Button 
                            size="sm" 
                            className="mt-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={() => handlePayForAppointment(app)}
                            disabled={!isRazorpayScriptLoaded || processingPaymentForAppointmentId === app.id || (RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID" || !RAZORPAY_KEY_ID)}
                        >
                            {processingPaymentForAppointmentId === app.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CreditCard className="mr-2 h-4 w-4"/>}
                            {processingPaymentForAppointmentId === app.id ? 'Processing...' : `Pay Now (₹${(APPOINTMENT_FIXED_PAY_AMOUNT / 100).toFixed(2)})`}
                        </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {(RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID" || !RAZORPAY_KEY_ID) && appointments.some(a => a.status === 'Payment Pending') && (
             <p className="text-xs text-destructive text-center mt-2">Razorpay integration is not fully configured. Payment for appointments will not proceed.</p>
           )}
            <Link href="/services" className="mt-6 block">
              <Button className="w-full md:w-auto">Book New Service</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

       <Card className="mt-8">
          <CardHeader className="flex flex-row justify-between items-center">
            <div className="flex items-center">
              <Building2 className="mr-2 h-6 w-6 text-primary" />
              <CardTitle>Address Book</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddNewAddress}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingAddresses && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading addresses...</p>
              </div>
            )}
            {!isLoadingAddresses && addresses.length === 0 && (
              <p className="text-muted-foreground">You have no saved addresses.</p>
            )}
            {!isLoadingAddresses && addresses.length > 0 && (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {addresses.map(address => (
                  <Card key={address.id} className="bg-background/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        {getAddressIcon(address.type)}
                        {address.type} Address
                        {address.isDefault && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Default</span>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-0.5">
                      <p>{address.line1}</p>
                      {address.line2 && <p>{address.line2}</p>}
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      <p>{address.country}</p>
                    </CardContent>
                    <CardFooter className="pt-2 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditAddress(address.id)}>
                        <Pencil className="mr-1 h-3 w-3" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteAddress(address)} disabled={isDeletingAddress && addressToDelete?.id === address.id}>
                        {isDeletingAddress && addressToDelete?.id === address.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin"/> : <Trash2 className="mr-1 h-3 w-3" />}
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isAddAddressModalOpen && currentUser && (
            <AddressFormModal
                isOpen={isAddAddressModalOpen}
                onClose={() => setIsAddAddressModalOpen(false)}
                userId={currentUser.uid}
                onAddressAdded={handleAddressAdded}
            />
        )}

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this address from your account.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeletingAddress}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeleteAddress} disabled={isDeletingAddress} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        {isDeletingAddress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}

