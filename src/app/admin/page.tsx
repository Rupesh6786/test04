
"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
    Activity, 
    Users, 
    DollarSign, 
    Loader2, 
    ListChecks, 
    ShieldAlert, 
    Package, 
    Wrench,
    PackageX,
    FileClock,
    ShoppingCart,
} from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, Timestamp, FirestoreError, where, collectionGroup } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import type { Appointment as AppointmentType, User as UserType, Product, Service, Order } from '@/types'; 
import { formatDistanceToNow } from 'date-fns';

// Local type for enriched recent appointments
interface RecentAppointment extends AppointmentType {
  userName?: string;
  userEmail?: string;
  userPhotoURL?: string | null;
}

export default function AdminDashboardPage() {
  const { currentUser, isAdmin } = useAuth();

  // State for stats cards
  const [stats, setStats] = useState({
    userCount: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalRevenue: 0,
    totalProducts: 0,
    outOfStockProducts: 0,
    activeServices: 0,
    totalOrders: 0,
  });
  
  // Unified state for data fetching
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    const names = name.split(' ');
    return names.length > 1 && names[0] && names[names.length - 1]
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };
  
  const getStatusColor = (status: AppointmentType['status']) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-700 border-green-300';
      case 'Payment Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      setIsLoading(false);
      setError("Access Denied: User is not an admin.");
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- Fetch all primary data concurrently ---
        const usersQuery = getDocs(collection(db, 'users'));
        const productsQuery = getDocs(collection(db, 'products'));
        const servicesQuery = getDocs(collection(db, 'services'));
        const ordersQuery = getDocs(collectionGroup(db, 'orders'));

        const [usersSnapshot, productsSnapshot, servicesSnapshot, ordersSnapshot] = await Promise.all([
          usersQuery, productsQuery, servicesQuery, ordersQuery
        ]);

        // --- Process Users & Create a map for easy lookup ---
        const userCount = usersSnapshot.size;
        const usersDataMap = new Map<string, UserType>();
        usersSnapshot.docs.forEach(userDoc => {
            const userData = userDoc.data() as Omit<UserType, 'uid'>;
            usersDataMap.set(userDoc.id, { 
                uid: userDoc.id, 
                ...userData,
                createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : new Date(),
            });
        });

        // --- Process Products & Services ---
        const totalProducts = productsSnapshot.size;
        const outOfStockProducts = productsSnapshot.docs.filter(doc => (doc.data() as Product).stock === 0).length;
        const activeServices = servicesSnapshot.docs.filter(doc => (doc.data() as Service).status === 'Active').length;
        const totalOrders = ordersSnapshot.size;
        
        // --- Fetch ALL appointments from all users ---
        let allAppointments: AppointmentType[] = [];
        const appointmentPromises = usersSnapshot.docs.map(userDoc => 
            getDocs(collection(db, "users", userDoc.id, "appointments")).then(snap => 
                snap.docs.map(appDoc => ({ id: appDoc.id, ...appDoc.data() } as AppointmentType))
            )
        );
        const appointmentsByUsers = await Promise.all(appointmentPromises);
        allAppointments = appointmentsByUsers.flat();
        
        // --- Calculate STATS from allAppointments ---
        const totalAppointments = allAppointments.length;
        const pendingAppointments = allAppointments.filter(app => app.status === 'Payment Pending').length;
        const totalRevenue = allAppointments
            .filter(app => app.status === 'Completed' && app.pricePaid)
            .reduce((sum, app) => sum + (app.pricePaid || 0), 0) / 100;

        setStats({
          userCount,
          totalProducts,
          outOfStockProducts,
          activeServices,
          totalAppointments,
          pendingAppointments,
          totalRevenue,
          totalOrders,
        });

        // --- DERIVE and Enrich RECENT APPOINTMENTS from allAppointments ---
        allAppointments.sort((a, b) => {
            const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt as any).getTime();
            const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt as any).getTime();
            return dateB - dateA;
        });

        const recentSliced = allAppointments.slice(0, 5);

        const enrichedAppointments = recentSliced.map(app => {
            const userData = usersDataMap.get(app.userId);
            return {
                ...app,
                userName: userData?.displayName,
                userEmail: userData?.email,
                userPhotoURL: userData?.photoURL
            };
        });
        
        setRecentAppointments(enrichedAppointments);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        let errorDetails = error instanceof Error ? error.message : "Unknown dashboard fetch error";
        if (error instanceof FirestoreError) {
            errorDetails = `Firestore Error: ${error.message}`;
        }
        setError(errorDetails);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, isAdmin]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
      
      {error && ( 
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center"><ShieldAlert className="mr-2 h-5 w-5" /> Data Fetch Error</CardTitle>
          </CardHeader>
          <CardContent className="text-destructive-foreground">
             <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {/* --- STATS CARDS --- */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/appointments"><StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} isLoading={isLoading} /></Link>
        <Link href="/admin/users"><StatCard title="Total Users" value={stats.userCount} icon={Users} isLoading={isLoading} /></Link>
        <Link href="/admin/orders"><StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} isLoading={isLoading} /></Link>
        <Link href="/admin/appointments"><StatCard title="Total Appointments" value={stats.totalAppointments} icon={ListChecks} isLoading={isLoading} /></Link>
        <Link href="/admin/appointments"><StatCard title="Pending Appointments" value={stats.pendingAppointments} icon={Activity} isLoading={isLoading} /></Link>
        <Link href="/admin/products"><StatCard title="Total Products" value={stats.totalProducts} icon={Package} isLoading={isLoading} /></Link>
        <Link href="/admin/products"><StatCard title="Out of Stock" value={stats.outOfStockProducts} icon={PackageX} isLoading={isLoading} /></Link>
        <Link href="/admin/services"><StatCard title="Active Services" value={stats.activeServices} icon={Wrench} isLoading={isLoading} /></Link>
      </div>

      {/* --- RECENT ACTIVITY --- */}
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><FileClock className="mr-2 h-6 w-6"/> Recent Appointments</CardTitle>
            <CardDescription>A look at the latest service bookings. View all in the 'Appointments' tab.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : recentAppointments.length === 0 && !error ? (
              <p className="text-muted-foreground text-center py-10">No recent appointments found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Booked</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {recentAppointments.map((app) => (
                            <TableRow key={app.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={app.userPhotoURL || undefined} alt={app.userName || 'User'} />
                                    <AvatarFallback>{getInitials(app.userName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{app.userName || 'Unknown User'}</div>
                                    <div className="text-xs text-muted-foreground">{app.userEmail || 'No email'}</div>
                                </div>
                                </div>
                            </TableCell>
                            <TableCell>{app.serviceType}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`border ${getStatusColor(app.status)}`}>{app.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground text-xs">
                                {app.createdAt ? formatDistanceToNow(app.createdAt instanceof Timestamp ? app.createdAt.toDate() : new Date(app.createdAt as any), { addSuffix: true }) : 'N/A'}
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// Helper component for Stat Cards to reduce repetition
function StatCard({ title, value, icon: Icon, isLoading }: { title: string, value: string | number, icon: React.ElementType, isLoading: boolean }) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}
