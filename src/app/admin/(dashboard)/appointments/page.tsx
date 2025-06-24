
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
  ListChecks,
  Loader2,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  CalendarDays,
  User as UserIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Wrench as WrenchIcon,
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
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Appointment, User } from "@/types";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface EnrichedAppointment extends Appointment {
  userName?: string;
  userEmail?: string;
  originalUserId: string;
}

const appointmentStatuses: Appointment["status"][] = [
  "Payment Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

export default function AdminAppointmentsPage() {
  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();

  const [allAppointments, setAllAppointments] = useState<EnrichedAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof EnrichedAppointment, direction: 'ascending' | 'descending' } | null>(null);
  const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(null);

  // Helper function to truncate long emails
  const truncateEmail = (email?: string): string => {
    if (!email) return 'N/A';
    const [local, domain] = email.split('@');
    if (!domain) return email; // Not a valid email format for this logic

    const localPartMaxLength = 9;
    if (local.length > localPartMaxLength) {
      return `${local.substring(0, localPartMaxLength)}*@${domain}`;
    }
    return email;
  };

  const fetchAllAppointments = useCallback(async () => {
    if (!currentUser || !isAdmin) {
      console.warn("AdminAppointmentsPage: Not an admin or no current user. Aborting fetch.");
      setIsLoading(false);
      setAllAppointments([]);
      return;
    }
    setIsLoading(true);
    console.log("AdminAppointmentsPage: fetchAllAppointments started.");
    try {
      console.time("AdminAppointmentsPage:fetchUsersForAppointmentsPage");
      const usersCollectionRef = collection(db, "users");
      const userQuery = query(usersCollectionRef);
      const usersSnapshot = await getDocs(userQuery);
      console.timeEnd("AdminAppointmentsPage:fetchUsersForAppointmentsPage");
      
      console.log(`AdminAppointmentsPage: User query to '/users' returned ${usersSnapshot.size} documents.`);
      
      if (usersSnapshot.empty) {
        console.log("AdminAppointmentsPage: No users found in the database. No appointments will be fetched.");
        setAllAppointments([]);
        setIsLoading(false);
        return;
      }

      let appointmentsPromises: Promise<EnrichedAppointment[]>[] = [];
      console.time("AdminAppointmentsPage:fetchAppointmentsForAllUsers");

      usersSnapshot.forEach((userDoc) => {
        const userId = userDoc.id;
        const userDataFromUsersCollection = userDoc.data() as Partial<User>;
        console.log(`AdminAppointmentsPage: Processing user ID: ${userId}, Data from /users:`, JSON.stringify(userDataFromUsersCollection));

        const appointmentsColRef = collection(db, "users", userId, "appointments");
        const appointmentsQuery = query(appointmentsColRef);
        
        const userAppointmentsPromise = getDocs(appointmentsQuery).then(
          (appointmentsSnapshot) => {
            console.log(`AdminAppointmentsPage: User ${userId} has ${appointmentsSnapshot.size} appointments.`);
            return appointmentsSnapshot.docs.map((appDoc) => {
              const appData = appDoc.data() as Appointment;
              const userName = appData.name || userDataFromUsersCollection.displayName || 'N/A';
              const userEmail = appData.email || userDataFromUsersCollection.email || 'N/A';

              return {
                ...appData,
                id: appDoc.id,
                userName: userName,
                userEmail: userEmail,
                originalUserId: userId,
                createdAt: appData.createdAt instanceof Timestamp ? appData.createdAt.toDate() : (appData.createdAt ? new Date(appData.createdAt as any) : new Date()),
                bookingDate: appData.bookingDate
              } as EnrichedAppointment;
            });
          }
        ).catch(subError => {
          console.error(`AdminAppointmentsPage: Error fetching appointments for user ${userId}:`, subError);
          let errorDetails = subError instanceof Error ? subError.message : "Unknown error";
          if (subError instanceof FirestoreError) {
             errorDetails = `Firestore Error: ${subError.message} (Code: ${subError.code})`;
          }
          toast({
              title: `Error for User ${userId}`,
              description: `Could not load appointments: ${errorDetails}`,
              variant: "destructive",
          });
          return [];
        });
        appointmentsPromises.push(userAppointmentsPromise);
      });

      const appointmentsByUsers = await Promise.all(appointmentsPromises);
      const fetchedAppointments = appointmentsByUsers.flat();
      console.timeEnd("AdminAppointmentsPage:fetchAppointmentsForAllUsers");
      console.log(`AdminAppointmentsPage: Total appointments fetched after processing all users: ${fetchedAppointments.length}`);
      
      setAllAppointments(fetchedAppointments);
    } catch (error: any) {
      console.error("AdminAppointmentsPage: General error fetching users or processing appointments:", error);
      console.timeEnd("AdminAppointmentsPage:fetchUsersForAppointmentsPage"); // End timer if error occurred before appointments fetch
      console.timeEnd("AdminAppointmentsPage:fetchAppointmentsForAllUsers"); // End timer if error occurred during appointments fetch
      let generalErrorDetails = error instanceof Error ? error.message : "Unknown error";
      if (error instanceof FirestoreError) {
        generalErrorDetails = `Firestore Error: ${error.message} (Code: ${error.code})`;
      }
      toast({
          title: "Fetch Error",
          description: `Could not load data: ${generalErrorDetails}`,
          variant: "destructive",
      });
      setAllAppointments([]);
    } finally {
      setIsLoading(false);
      console.log("AdminAppointmentsPage: fetchAllAppointments completed.");
    }
  }, [currentUser, isAdmin, toast]);

  useEffect(() => {
    if (currentUser && isAdmin) {
      fetchAllAppointments();
    } else {
        setIsLoading(false);
        if (!currentUser) console.log("AdminAppointmentsPage Effect: No current user, not fetching.");
        else if (!isAdmin) console.log("AdminAppointmentsPage Effect: User is not admin, not fetching.");
    }
  }, [currentUser, isAdmin, fetchAllAppointments]);

  const handleUpdateStatus = async (
    originalUserId: string,
    appointmentId: string,
    newStatus: Appointment["status"]
  ) => {
    setUpdatingStatusFor(appointmentId);
    try {
      const appointmentRef = doc(db, "users", originalUserId, "appointments", appointmentId);
      await updateDoc(appointmentRef, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Appointment status changed to ${newStatus}.`,
      });
      setAllAppointments(prev => prev.map(app =>
        app.id === appointmentId && app.originalUserId === originalUserId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update appointment status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusFor(null);
    }
  };

  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = [...allAppointments];

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.userName?.toLowerCase().includes(lowerSearchTerm) ||
          app.userEmail?.toLowerCase().includes(lowerSearchTerm) ||
          app.serviceType.toLowerCase().includes(lowerSearchTerm) ||
          app.id.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    if (sortConfig !== null && filtered.length > 0) {
      filtered.sort((a, b) => {
          let valA = a[sortConfig.key];
          let valB = b[sortConfig.key];

          if (sortConfig.key === 'bookingDate' || sortConfig.key === 'createdAt') {
              const dateA = valA ? new Date(valA as string | Date | Timestamp) : new Date(0);
              const dateB = valB ? new Date(valB as string | Date | Timestamp) : new Date(0);
              valA = isNaN(dateA.getTime()) ? new Date(0) as any : dateA as any;
              valB = isNaN(dateB.getTime()) ? new Date(0) as any : dateB as any;
          } else if (typeof valA === 'string' && typeof valB === 'string') {
              valA = valA.toLowerCase() as any;
              valB = valB.toLowerCase() as any;
          }


          if (valA === undefined || valA === null) valA = '' as any;
          if (valB === undefined || valB === null) valB = '' as any;
          
          if (valA < valB) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (valA > valB) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
      });
    }
    return filtered;
  }, [allAppointments, statusFilter, searchTerm, sortConfig]);

  const requestSort = (key: keyof EnrichedAppointment) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof EnrichedAppointment) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };
  
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-700 border-green-300';
      case 'Payment Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (!isLoading && !isAdmin && !currentUser?.uid) {
    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <p className="text-destructive">You do not have permission to view this page or are not logged in as an admin.</p>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <ListChecks className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Manage Appointments</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Service Appointments</CardTitle>
          <CardDescription>
            View, filter, sort, and manage all customer appointments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search (User, Service, ID)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {appointmentStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchAllAppointments} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading && !allAppointments.length ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Refresh Data
            </Button>
          </div>

          {isLoading && !allAppointments.length ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Loading appointments...</p>
            </div>
          ) : !filteredAndSortedAppointments.length && !isLoading ? (
            <div className="text-center py-10">
              <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium text-foreground">No appointments found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                There are no appointments matching your current filters, no users have appointments, or no users were found.
              </p>
               <p className="mt-1 text-xs text-muted-foreground">
                Check console logs for details on user and appointment fetching.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => requestSort('userName')} className="cursor-pointer hover:bg-muted/50 min-w-[200px]">
                        User {getSortIndicator('userName')}
                      </TableHead>
                      <TableHead onClick={() => requestSort('serviceType')} className="cursor-pointer hover:bg-muted/50 min-w-[160px]">
                        Service {getSortIndicator('serviceType')}
                      </TableHead>
                      <TableHead onClick={() => requestSort('bookingDate')} className="cursor-pointer hover:bg-muted/50 min-w-[200px]">
                        Date & Time {getSortIndicator('bookingDate')}
                      </TableHead>
                      <TableHead className="min-w-[220px]">Address</TableHead>
                      <TableHead onClick={() => requestSort('status')} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap">
                        Status {getSortIndicator('status')}
                      </TableHead>
                      <TableHead onClick={() => requestSort('pricePaid')} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap text-right">
                        Price Paid {getSortIndicator('pricePaid')}
                      </TableHead>
                      <TableHead className="hidden lg:table-cell whitespace-nowrap">Payment ID</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedAppointments.map((app) => (
                      <TableRow key={app.id + app.originalUserId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground shrink-0"/>
                            <div>
                              <div>{app.userName || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">{truncateEmail(app.userEmail)}</div>
                              <div className="text-xs text-muted-foreground flex items-center"><PhoneIcon className="h-3 w-3 mr-1"/>{app.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                              <WrenchIcon className="h-4 w-4 text-muted-foreground shrink-0"/> {app.serviceType}
                          </div>
                          {app.budget && <div className="text-xs text-muted-foreground">Budget: {app.budget}</div>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0"/>
                            {app.bookingDate ? format(parseISO(app.bookingDate), "MMM d, yyyy") : 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground ml-5">{app.bookingTime}</div>
                          <div className="text-xs text-muted-foreground ml-5">Created: {app.createdAt ? format(app.createdAt as Date, "MMM d, yy, p") : 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1">
                            <MapPinIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5"/> {app.address}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(app.status)}`}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {app.pricePaid ? `₹${(app.pricePaid / 100).toFixed(2)}` : 'N/A'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell whitespace-nowrap max-w-[100px] truncate">
                          {app.paymentId || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={updatingStatusFor === app.id}>
                                {updatingStatusFor === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {appointmentStatuses.map(status => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() => handleUpdateStatus(app.originalUserId, app.id, status)}
                                  disabled={app.status === status || updatingStatusFor === app.id}
                                >
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
                {filteredAndSortedAppointments.map((app) => (
                  <Card key={app.id + app.originalUserId} className="relative">
                    <CardHeader className="p-4 pb-2">
                       <div className="flex items-start justify-between">
                         <div>
                            <CardTitle className="text-lg mb-1">{app.userName || 'N/A'}</CardTitle>
                            <CardDescription className="text-sm">{truncateEmail(app.userEmail)}</CardDescription>
                         </div>
                         <div className="absolute top-2 right-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={updatingStatusFor === app.id}>
                                  {updatingStatusFor === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {appointmentStatuses.map(status => (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleUpdateStatus(app.originalUserId, app.id, status)}
                                    disabled={app.status === status || updatingStatusFor === app.id}
                                  >
                                    Mark as {status}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 text-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <span className="text-muted-foreground font-semibold">Status</span>
                            <Badge variant="outline" className={`text-xs font-medium ${getStatusColor(app.status)}`}>
                                {app.status}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-[auto,1fr] items-start gap-x-4 gap-y-2">
                            <span className="font-semibold text-muted-foreground flex items-center gap-1.5"><WrenchIcon className="h-4 w-4"/>Service</span>
                            <span>{app.serviceType}</span>
                        
                            <span className="font-semibold text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-4 w-4"/>Date</span>
                            <span>{app.bookingDate ? format(parseISO(app.bookingDate), "MMM d, yyyy") : 'N/A'} at {app.bookingTime}</span>

                            <span className="font-semibold text-muted-foreground flex items-center gap-1.5"><MapPinIcon className="h-4 w-4"/>Address</span>
                            <span>{app.address}</span>
                            
                            <span className="font-semibold text-muted-foreground flex items-center gap-1.5"><PhoneIcon className="h-4 w-4"/>Contact</span>
                            <span>{app.phone}</span>
                            
                            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">Price</span>
                            <span>{app.pricePaid ? `₹${(app.pricePaid / 100).toFixed(2)}` : 'N/A'}</span>

                            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">Payment ID</span>
                            <span className="truncate">{app.paymentId || 'N/A'}</span>
                        </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-foreground mb-2">Future Enhancements:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Detailed view for each appointment.</li>
              <li>Pagination for large datasets.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
