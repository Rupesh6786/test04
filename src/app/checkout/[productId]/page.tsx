
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import type { Product, Address, Order } from '@/types';
import { Loader2, PlusCircle, Home, Briefcase, MapPin, ShoppingCart, ShieldAlert, CreditCard, Truck } from 'lucide-react';
import { AddressFormModal } from '@/components/AddressFormModal';
import { useToast } from '@/hooks/use-toast';
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, Unsubscribe, doc, Timestamp, addDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import type {} from '@/types/razorpay'; 
import { format } from 'date-fns';

const RAZORPAY_KEY_ID = "rzp_test_lw1YZ20Ss4PtqR"; 

export default function CheckoutPage() {
  const params = useParams();
  const productId = params.productId as string;
  const router = useRouter();
  const { currentUser, isLoggedIn, loading: authLoading, openAuthModal } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isRazorpayScriptLoaded, setIsRazorpayScriptLoaded] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    const scriptId = 'razorpay-checkout-script';
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
      toast({ title: "Error", description: "Could not load payment gateway. Please try again later.", variant: "destructive"});
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
    let unsubscribeProduct: Unsubscribe | undefined;
    if (productId) {
      setIsLoadingProduct(true);
      setProductError(null);
      const productRef = doc(db, "products", productId);
      unsubscribeProduct = onSnapshot(productRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const fetchedProduct = {
            id: docSnap.id,
            ...data,
             createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
             updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
          } as Product;
          
          if (fetchedProduct.stock <= 0) {
            setProductError("This product is currently out of stock.");
            setProduct(null); 
            toast({ title: "Out of Stock", description: "This product cannot be purchased as it's out of stock.", variant: "destructive"});
          } else {
            setProduct(fetchedProduct);
          }

        } else {
          setProductError("Product not found.");
          setProduct(null);
        }
        setIsLoadingProduct(false);
      }, (error) => {
        console.error("Error fetching product for checkout:", error);
        setProductError("Failed to load product details.");
        setIsLoadingProduct(false);
      });
    } else {
      setIsLoadingProduct(false);
      setProductError("No product ID provided.");
    }
    return () => {
      if (unsubscribeProduct) unsubscribeProduct();
    };
  }, [productId, toast]);

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
        const defaultAddress = fetchedAddresses.find(a => a.isDefault);
        if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
        } else if (fetchedAddresses.length > 0) {
            setSelectedAddressId(fetchedAddresses[0].id);
        }
        setIsLoadingAddresses(false);
      }, (error) => {
        console.error("Error fetching addresses: ", error);
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

  const createOrderAndReduceStock = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const productRef = doc(db, "products", orderData.productId);
    
    const ordersCollectionPath = `users/${orderData.userId}/orders`;
    const ordersColRef = collection(db, ordersCollectionPath);

    try {
      await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
          throw new Error("Product does not exist.");
        }

        const currentStock = productDoc.data().stock;
        if (currentStock <= 0) {
          throw new Error("Product is out of stock.");
        }

        transaction.update(productRef, { stock: currentStock - 1 });
        transaction.set(doc(ordersColRef), { ...orderData, createdAt: serverTimestamp() });
      });
      return true;
    } catch (e: any) {
      console.error("Order transaction failed: ", e);
      throw e;
    }
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (!isLoggedIn || !currentUser) {
      toast({ title: "Login Required", description: "Please log in to proceed.", variant: "destructive" });
      openAuthModal();
      return;
    }
    if (!selectedAddressId) {
      toast({ title: "Address Required", description: "Please select or add a shipping address.", variant: "destructive" });
      return;
    }
    if (!product) {
        toast({ title: "Error", description: "Product details not available or product is out of stock.", variant: "destructive" });
        return;
    }
    if (product.stock <= 0) {
      toast({ title: "Out of Stock", description: "This product cannot be purchased as it's out of stock.", variant: "destructive"});
      return;
    }

    setIsProcessingPayment(true);
    const selectedAddr = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddr) {
        toast({ title: "Error", description: "Selected address not found.", variant: "destructive"});
        setIsProcessingPayment(false);
        return;
    }
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    const commonOrderData = {
      userId: currentUser.uid,
      productId: product.id,
      productDetails: {
        brand: product.brand,
        model: product.model,
        price: product.price * 100, // Store in paise for consistency
        imageUrl: (product.imageUrls && product.imageUrls[0]) || product.imageUrl || "",
      },
      shippingAddress: selectedAddr,
      estimatedDeliveryDate: Timestamp.fromDate(deliveryDate),
    };

    if (paymentMethod === 'cod') {
        try {
            await createOrderAndReduceStock({
                ...commonOrderData,
                status: 'Placed',
                paymentMethod: 'COD',
                pricePaid: 0,
            });
            toast({ title: "Order Placed!", description: "Your Cash on Delivery order has been confirmed." });
            router.push('/my-account');
        } catch (error: any) {
            toast({ title: "Order Failed", description: error.message || "Could not place your order.", variant: "destructive" });
        } finally {
            setIsProcessingPayment(false);
        }
    } else { // Online Payment
        if (!isRazorpayScriptLoaded) {
            toast({ title: "Payment Gateway Loading", description: "Please wait for the payment gateway to load or try refreshing.", variant: "destructive"});
            setIsProcessingPayment(false);
            return;
        }
        if (RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID" || !RAZORPAY_KEY_ID) {
            toast({ title: "Configuration Error", description: "Razorpay Key ID not configured.", variant: "destructive" });
            setIsProcessingPayment(false);
            return;
        }
        
        const amountInPaise = product.price * 100;

        const options: RazorpayOptions = {
            key: RAZORPAY_KEY_ID,
            amount: amountInPaise,
            currency: "INR",
            name: "Classic-Solution", 
            description: `Order for ${product.brand} ${product.model}`,
            handler: async (response) => {
                try {
                    await createOrderAndReduceStock({
                        ...commonOrderData,
                        status: 'Confirmed',
                        paymentMethod: 'Online',
                        paymentId: response.razorpay_payment_id,
                        pricePaid: amountInPaise,
                    });
                    toast({ title: "Payment Successful!", description: `Payment ID: ${response.razorpay_payment_id}. Your order is confirmed.` });
                    router.push('/my-account');
                } catch (error: any) {
                    toast({ title: "Payment Processed, Order Failed", description: "Please contact support with your Payment ID.", variant: "destructive" });
                } finally {
                    setIsProcessingPayment(false);
                }
            },
            prefill: { name: currentUser.displayName || "", email: currentUser.email || "" },
            notes: { address: selectedAddr.line1, productId: product.id, userId: currentUser.uid },
            theme: { color: "#2563EB" },
            modal: { ondismiss: () => {
                toast({ title: "Payment Canceled", variant: "destructive"});
                setIsProcessingPayment(false);
            }}
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response: any) => {
                toast({ title: "Payment Failed", description: `${response.error.description || 'An unknown error occurred.'} (Code: ${response.error.code})`, variant: "destructive" });
                setIsProcessingPayment(false);
            });
            rzp.open();
        } catch (error) {
            toast({ title: "Payment Error", description: "Could not initialize payment gateway.", variant: "destructive" });
            setIsProcessingPayment(false);
        }
    }
  }, [isLoggedIn, currentUser, selectedAddressId, product, toast, openAuthModal, router, addresses, isRazorpayScriptLoaded, paymentMethod, createOrderAndReduceStock]);
  
  const getAddressIcon = (type: Address['type']) => {
    switch (type) {
      case 'Home': return <Home className="w-4 h-4 text-primary mr-2 shrink-0" />;
      case 'Work': return <Briefcase className="w-4 h-4 text-primary mr-2 shrink-0" />;
      default: return <MapPin className="w-4 h-4 text-primary mr-2 shrink-0" />;
    }
  };

  const handleAddressAdded = () => {
    setIsAddAddressModalOpen(false);
    toast({ title: "Address Added", description: "New address successfully saved."});
  };

  if (authLoading || isLoadingProduct) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (productError && !isLoadingProduct) {
    if (productError === "Product not found.") {
        notFound();
    }
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-destructive mb-2">Checkout Error</h1>
            <p className="text-muted-foreground">{productError}</p>
            <Button onClick={() => router.push('/products')} className="mt-6">Go to Products</Button>
        </div>
    );
  }

  if (!product && !isLoadingProduct && !productError) {
    notFound();
  }
  
  if (!product) {
      return null; 
  }

  const displayImage = (product.imageUrls && product.imageUrls[0]) || product.imageUrl || "https://placehold.co/80x60.png";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 mr-3 text-primary" /> Checkout
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Image
                  src={displayImage}
                  alt={`${product.brand} ${product.model}`}
                  width={80}
                  height={60}
                  className="rounded-md object-cover"
                />
                <div>
                  <h3 className="font-semibold">{product.brand} {product.model}</h3>
                  <p className="text-sm text-muted-foreground">{product.capacity} - {product.condition}</p>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span>₹{product.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span>Free (Standard)</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span className="text-accent">₹{product.price.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="font-headline text-xl">Shipping Address</CardTitle>
              {isLoggedIn && (
                <Button variant="outline" size="sm" onClick={() => setIsAddAddressModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!isLoggedIn ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Please log in to select or add an address.</p>
                  <Button onClick={() => openAuthModal()}>Login / Register</Button>
                </div>
              ) : isLoadingAddresses ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading addresses...</p>
                </div>
              ) : addresses.length === 0 ? (
                 <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No addresses found. Please add one.</p>
                     <Button variant="outline" onClick={() => setIsAddAddressModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
                    </Button>
                </div>
              ) : (
                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {addresses.map((address) => (
                      <Label
                        key={address.id}
                        htmlFor={`checkout-${address.id}`}
                        className="flex items-start p-4 border rounded-md cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                      >
                        <RadioGroupItem value={address.id} id={`checkout-${address.id}`} className="mr-3 mt-1 shrink-0" />
                        <div className="flex-grow">
                          <div className="flex items-center font-semibold mb-1">
                             {getAddressIcon(address.type)}
                             {address.type} Address
                             {address.isDefault && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Default</span>}
                          </div>
                          <p className="text-sm text-muted-foreground">{address.line1}</p>
                          {address.line2 && <p className="text-sm text-muted-foreground">{address.line2}</p>}
                          <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.zipCode} - {address.country}</p>
                        </div>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {isLoggedIn && (
            <>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'online' | 'cod')} className="space-y-3">
                        <Label htmlFor="online" className="flex items-start p-4 border rounded-md cursor-pointer hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <RadioGroupItem value="online" id="online" className="mr-3 mt-1 shrink-0" />
                            <div className="flex-grow">
                                <div className="flex items-center font-semibold"><CreditCard className="mr-2 h-4 w-4 text-primary"/>Online Payment</div>
                                <p className="text-sm text-muted-foreground">Pay securely with Razorpay (Cards, UPI, Netbanking).</p>
                            </div>
                        </Label>
                        <Label htmlFor="cod" className="flex items-start p-4 border rounded-md cursor-pointer hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <RadioGroupItem value="cod" id="cod" className="mr-3 mt-1 shrink-0" />
                            <div className="flex-grow">
                                <div className="flex items-center font-semibold"><Truck className="mr-2 h-4 w-4 text-primary"/>Cash on Delivery</div>
                                <p className="text-sm text-muted-foreground">Pay in cash when your product is delivered.</p>
                            </div>
                        </Label>
                    </RadioGroup>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center"><Truck className="mr-2 h-5 w-5"/>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Estimated delivery by: <span className="font-semibold text-foreground">{format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'PPP')}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Delivery dates are estimates and may vary.</p>
                </CardContent>
            </Card>
            </>
          )}
          
          {isLoggedIn && (
            <Button 
                size="lg" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3" 
                onClick={handlePlaceOrder}
                disabled={
                    !selectedAddressId ||
                    (paymentMethod === 'online' && !isRazorpayScriptLoaded) ||
                    isProcessingPayment ||
                    (product?.stock ?? 0) <= 0 ||
                    (paymentMethod === 'online' && (RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID" || !RAZORPAY_KEY_ID))
                }
            >
                {isProcessingPayment ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isProcessingPayment ? 'Processing...' : 'Place Order'}
            </Button>
          )}
           {(RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID" || !RAZORPAY_KEY_ID) && isLoggedIn && paymentMethod === 'online' && (
             <p className="text-xs text-destructive text-center">Razorpay integration is not fully configured. Online payment will not proceed.</p>
           )}
        </div>
      </div>

      {isAddAddressModalOpen && currentUser && (
        <AddressFormModal
          isOpen={isAddAddressModalOpen}
          onClose={() => setIsAddAddressModalOpen(false)}
          userId={currentUser.uid}
          onAddressAdded={handleAddressAdded}
        />
      )}
    </div>
  );
}
