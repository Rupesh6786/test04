"use client";

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, Unsubscribe, Timestamp } from 'firebase/firestore';
import type { Order } from '@/types';
import { Loader2, ArrowLeft, Package, MapPin, CreditCard, Truck, CheckCircle, CircleDotDashed, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const getOrderStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-700';
      case 'Placed': return 'bg-blue-100 text-blue-700';
      case 'Shipped': return 'bg-purple-100 text-purple-700';
      case 'Delivered': return 'bg-primary/20 text-primary';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
};

const StatusStepper = ({ status, estimatedDeliveryDate }: { status: Order['status'], estimatedDeliveryDate?: any }) => {
    const statuses: Order['status'][] = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];
    const currentIndex = statuses.indexOf(status);

    const getStatusIcon = (s: Order['status'], index: number) => {
        if (index < currentIndex) {
            return <CheckCircle className="w-6 h-6 text-green-500" />;
        }
        if (index === currentIndex) {
            return <CircleDotDashed className="w-6 h-6 text-primary animate-spin" />;
        }
        return <Circle className="w-6 h-6 text-muted" />;
    };

    return (
        <div className="w-full">
            <div className="flex items-center">
                {statuses.map((s, index) => (
                    <React.Fragment key={s}>
                        <div className="flex flex-col items-center">
                            <div className={cn("rounded-full p-1 bg-background", index <= currentIndex ? 'text-primary' : 'text-muted-foreground')}>
                               {getStatusIcon(s, index)}
                            </div>
                            <p className={cn("text-xs text-center mt-1", index <= currentIndex ? 'font-semibold text-foreground' : 'text-muted-foreground')}>{s}</p>
                        </div>
                        {index < statuses.length - 1 && (
                            <div className={cn("flex-auto border-t-2 transition-colors duration-500", index < currentIndex ? 'border-primary' : 'border-dashed')} />
                        )}
                    </React.Fragment>
                ))}
            </div>
            {status !== 'Delivered' && estimatedDeliveryDate && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                    Estimated Delivery: {format(estimatedDeliveryDate.toDate(), "PPP")}
                </p>
            )}
        </div>
    );
};

export default function OrderDetailPage() {
    const { orderId } = useParams();
    const { currentUser, loading: authLoading } = useAuth();
    const router = useRouter();

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (authLoading) return;
        if (!currentUser) {
            router.push('/my-account');
            return;
        }
        if (!orderId || typeof orderId !== 'string') {
            setError("Invalid Order ID.");
            setIsLoading(false);
            return;
        }

        const orderRef = doc(db, "users", currentUser.uid, "orders", orderId);
        const unsubscribe: Unsubscribe = onSnapshot(orderRef, (docSnap) => {
            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
            } else {
                setError("Order not found.");
            }
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching order details:", err);
            setError("Failed to load order details.");
            setIsLoading(false);
        });

        return () => unsubscribe();

    }, [orderId, currentUser, authLoading, router]);
    
    if (isLoading || authLoading) {
        return (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
    }
    
    if (error) {
        return notFound();
    }

    if (!order) {
        return null;
    }
    
    const amountDue = (order.productDetails.price / 100).toFixed(2);
    const amountPaid = (order.pricePaid / 100).toFixed(2);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-6">
                <Button variant="ghost" onClick={() => router.push('/my-account')} className="text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to My Account
                </Button>
            </div>
            <Card className="mb-8">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                            <CardTitle className="text-2xl font-bold">Order Details</CardTitle>
                            <CardDescription className="mt-1">Order ID: {order.id}</CardDescription>
                            <p className="text-sm text-muted-foreground">
                                Placed on: {order.createdAt ? format((order.createdAt as Timestamp).toDate(), "PPP, p") : 'N/A'}
                            </p>
                        </div>
                        <Badge className={cn("text-base px-3 py-1", getOrderStatusColor(order.status))}>{order.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <StatusStepper status={order.status} estimatedDeliveryDate={order.estimatedDeliveryDate}/>
                </CardContent>
            </Card>
            
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center"><Package className="mr-2 h-5 w-5"/>Product Details</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Image 
                                    src={order.productDetails.imageUrl || 'https://placehold.co/120x90.png'}
                                    alt={order.productDetails.brand}
                                    width={120}
                                    height={90}
                                    className="rounded-md border object-cover"
                                />
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-lg">{order.productDetails.brand} {order.productDetails.model}</h3>
                                    <p className="text-muted-foreground">Qty: 1</p>
                                    <p className="font-semibold text-lg mt-2">₹{(order.productDetails.price / 100).toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center"><MapPin className="mr-2 h-5 w-5"/>Shipping Address</CardTitle></CardHeader>
                        <CardContent>
                            <address className="not-italic text-muted-foreground">
                                <p className="font-semibold text-foreground">{currentUser?.displayName}</p>
                                <p>{order.shippingAddress.line1}</p>
                                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </address>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5"/>Payment Summary</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>₹{amountDue}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Delivery:</span>
                                <span>₹0.00</span>
                            </div>
                            <Separator/>
                            <div className="flex justify-between font-semibold text-base">
                                <span>Total:</span>
                                <span>₹{amountDue}</span>
                            </div>
                            <Separator/>
                            <div className="text-sm">
                                <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                                {order.paymentMethod === 'COD' && (
                                    <p className="text-primary font-semibold">Amount to be paid on delivery: ₹{amountDue}</p>
                                )}
                                {order.paymentMethod === 'Online' && (
                                     <p>Amount Paid: ₹{amountPaid}</p>
                                )}
                                {order.paymentId && <p className="truncate">Payment ID: {order.paymentId}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
