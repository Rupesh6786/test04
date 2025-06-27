
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import type { DateRange } from "react-day-picker";
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Users as UsersIcon,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Loader2,
  Mail,
  CalendarPlus,
  Eye,
  UserCog,
  ShieldOff,
  ShieldCheck,
  Calendar as CalendarIcon,
  Building2,
  ListChecks,
  X,
  Phone,
  Wrench,
  CalendarDays,
  MapPin,
  Home,
  Briefcase
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  doc,
  updateDoc,
  Timestamp,
  FirestoreError,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { User, Appointment, Address } from "@/types";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

// Detail Modal Component defined within the page for simplicity
function UserDetailModal({ user, isOpen, onClose }: { user: User | null; isOpen: boolean; onClose: () => void; }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Appointments
        const apptColRef = collection(db, "users", user.uid, "appointments");
        const apptQuery = query(apptColRef, orderBy("createdAt", "desc"));
        const apptSnapshot = await getDocs(apptQuery);
        const fetchedAppointments = apptSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        setAppointments(fetchedAppointments);

        // Fetch Addresses
        const addrColRef = collection(db, "users", user.uid, "addresses");
        const addrSnapshot = await getDocs(addrColRef);
        const fetchedAddresses = addrSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address));
        setAddresses(fetchedAddresses);

      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isOpen]);

  const getAddressIcon = (type: Address['type']) => {
    switch (type) {
      case 'Home': return <Home className="w-4 h-4 text-primary mr-2 shrink-0" />;
      case 'Work': return <Briefcase className="w-4 h-4 text-primary mr-2 shrink-0" />;
      default: return <MapPin className="w-4 h-4 text-primary mr-2 shrink-0" />;
    }
  };
  
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>{(user.displayName || user.email || 'U').substring(0,2)}</AvatarFallback>
            </Avatar>
            User Details: {user.displayName || 'N/A'}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
             <div>
              <h3 className="font-semibold text-lg flex items-center mb-2"><ListChecks className="mr-2 h-5 w-5 text-primary"/> Appointments ({appointments.length})</h3>
              {appointments.length > 0 ? (
                <div className="border rounded-md max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map(app => (
                        <TableRow key={app.id}>
                          <TableCell><Wrench className="inline mr-1 h-3 w-3"/>{app.serviceType}</TableCell>
                          <TableCell><CalendarDays className="inline mr-1 h-3 w-3"/>{app.bookingDate ? format(parseISO(app.bookingDate), "MMM d, yyyy") : 'N/A'}</TableCell>
                          <TableCell><Badge variant="outline">{app.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : <p className="text-muted-foreground text-sm">No appointments found for this user.</p>}
            </div>

            <div>
              <h3 className="font-semibold text-lg flex items-center mb-2"><Building2 className="mr-2 h-5 w-5 text-primary"/> Addresses ({addresses.length})</h3>
              {addresses.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {addresses.map(addr => (
                    <div key={addr.id} className="p-3 border rounded-md text-sm">
                      <p className="font-semibold flex items-center">{getAddressIcon(addr.type)} {addr.type} {addr.isDefault && <Badge className="ml-2">Default</Badge>}</p>
                      <address className="not-italic text-muted-foreground">
                        {addr.line1}<br/>
                        {addr.line2 && <>{addr.line2}<br/></>}
                        {addr.city}, {addr.state} {addr.zipCode}
                      </address>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">No addresses found for this user.</p>}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsersPage() {
  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof User, direction: 'ascending' | 'descending' } | null>({ key: 'createdAt', direction: 'descending' });
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
  const [userToUpdate, setUserToUpdate] = useState<{ user: User, status: 'suspended' | 'deactivated' | 'active' } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchAllUsers = useCallback(async () => {
    if (!currentUser || !isAdmin) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const usersCollectionRef = collection(db, "users");
      const userQuery = query(usersCollectionRef);
      const usersSnapshot = await getDocs(userQuery);
      const fetchedUsers = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          uid: doc.id,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        } as User;
      });
      setAllUsers(fetchedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      let errorDetails = error instanceof Error ? error.message : "Unknown error";
      if (error instanceof FirestoreError) {
        errorDetails = `Firestore Error: ${error.message}`;
      }
      toast({
        title: "Fetch Error",
        description: `Could not load users: ${errorDetails}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, isAdmin, toast]);
  
  useEffect(() => {
    if (currentUser && isAdmin) {
      fetchAllUsers();
    } else {
      setIsLoading(false);
    }
  }, [currentUser, isAdmin, fetchAllUsers]);

  const handleUpdateStatus = async () => {
    if (!userToUpdate) return;

    setIsUpdatingStatus(true);
    try {
      const userRef = doc(db, "users", userToUpdate.user.uid);
      await updateDoc(userRef, { accountStatus: userToUpdate.status });

      setAllUsers(prev => prev.map(u => u.uid === userToUpdate.user.uid ? { ...u, accountStatus: userToUpdate.status } : u));
      toast({ title: "Status Updated", description: `${userToUpdate.user.displayName}'s account has been ${userToUpdate.status}.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user status.", variant: "destructive" });
    } finally {
      setIsUpdatingStatus(false);
      setUserToUpdate(null);
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...allUsers];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.displayName?.toLowerCase().includes(lowerSearch) ||
        user.email?.toLowerCase().includes(lowerSearch) ||
        user.uid.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => (user.accountStatus || 'active') === statusFilter);
    }

    if (providerFilter !== 'all') {
      filtered = filtered.filter(user => user.provider === providerFilter);
    }
    
    if (dateRange?.from) {
        filtered = filtered.filter(user => {
            if (!user.createdAt) return false;
            const userDate = user.createdAt instanceof Timestamp ? user.createdAt.toDate() : new Date(user.createdAt);
            if (isNaN(userDate.getTime())) return false;
            
            let fromDate = new Date(dateRange.from as Date);
            fromDate.setHours(0,0,0,0);
            if (userDate < fromDate) return false;

            if (dateRange.to) {
                let toDate = new Date(dateRange.to);
                toDate.setHours(23,59,59,999);
                if (userDate > toDate) return false;
            }
            return true;
        });
    }

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
          let valA = a[sortConfig.key];
          let valB = b[sortConfig.key];
          if (sortConfig.key === 'createdAt') {
              valA = a.createdAt ? (a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt as any).getTime()) : 0;
              valB = b.createdAt ? (b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt as any).getTime()) : 0;
          }
          if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
      });
    }

    return filtered;
  }, [allUsers, searchTerm, sortConfig, statusFilter, providerFilter, dateRange]);

  const requestSort = (key: keyof User) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
    const getSortIndicator = (key: keyof User) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };
  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    const names = name.split(' ');
    return names.length > 1 && names[0] && names[names.length - 1]
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const getStatusBadgeVariant = (status?: User['accountStatus']): { variant: "default" | "secondary" | "destructive" | "outline", className: string } => {
    switch (status) {
      case 'suspended': return { variant: 'destructive', className: 'bg-yellow-500/20 text-yellow-700 border-yellow-400' };
      case 'deactivated': return { variant: 'destructive', className: 'bg-red-500/20 text-red-700 border-red-400' };
      case 'active':
      default:
        return { variant: 'default', className: 'bg-green-500/20 text-green-700 border-green-400' };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <UsersIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Registered User Accounts</CardTitle>
          <CardDescription>
            View, search, and manage all registered user accounts on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row gap-2 flex-wrap">
            <div className="relative flex-grow min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Name, Email, UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
             <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Filter Provider" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="google.com">Google</SelectItem>
                <SelectItem value="email/password">Email</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant="outline" className={cn("w-full justify-start text-left font-normal md:w-auto", !dateRange && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL d, y")} - ${format(dateRange.to, "LLL d, y")}` : format(dateRange.from, "LLL d, y")) : <span>Pick a date range</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
              </PopoverContent>
            </Popover>
          </div>

          {isLoading && !allUsers.length ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : !filteredAndSortedUsers.length && !isLoading ? (
            <div className="text-center py-10">
                <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-foreground">No users found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    There are no users matching your current filters.
                </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => requestSort('displayName')} className="cursor-pointer">User {getSortIndicator('displayName')}</TableHead>
                      <TableHead onClick={() => requestSort('createdAt')} className="cursor-pointer">Registered {getSortIndicator('createdAt')}</TableHead>
                      <TableHead onClick={() => requestSort('accountStatus')} className="cursor-pointer">Status {getSortIndicator('accountStatus')}</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>UID</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedUsers.map((user) => {
                      const status = user.accountStatus || 'active';
                      const statusStyle = getStatusBadgeVariant(status);
                      return (
                      <TableRow key={user.uid}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9"><AvatarImage src={user.photoURL || undefined} /><AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback></Avatar>
                            <div>
                              <div className="font-semibold">{user.displayName || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3"/> {user.email || 'No email'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.createdAt ? format(user.createdAt instanceof Timestamp ? user.createdAt.toDate() : new Date(user.createdAt as any), "MMM d, yyyy") : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusStyle.variant} className={cn('capitalize', statusStyle.className)}>{status}</Badge>
                        </TableCell>
                        <TableCell>{user.provider || 'Unknown'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[100px]">{user.uid}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => { setSelectedUserForDetails(user); setIsDetailModalOpen(true); }}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {status !== 'active' && (
                                  <DropdownMenuItem onClick={() => setUserToUpdate({ user, status: 'active' })}>
                                  <ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> Reactivate User
                                  </DropdownMenuItem>
                              )}
                              {status === 'active' && (
                                  <DropdownMenuItem onClick={() => setUserToUpdate({ user, status: 'suspended' })} className="text-yellow-600 focus:bg-yellow-100 focus:text-yellow-700">
                                  <ShieldOff className="mr-2 h-4 w-4" /> Suspend User
                                  </DropdownMenuItem>
                              )}
                              {status !== 'deactivated' && (
                                  <DropdownMenuItem onClick={() => setUserToUpdate({ user, status: 'deactivated' })} className="text-red-600 focus:bg-red-100 focus:text-red-700">
                                  <UserCog className="mr-2 h-4 w-4" /> Deactivate User
                                  </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {filteredAndSortedUsers.map((user) => {
                  const status = user.accountStatus || 'active';
                  const statusStyle = getStatusBadgeVariant(status);
                  return (
                    <Card key={user.uid} className="relative">
                      <CardHeader className="flex flex-row items-start gap-4 p-4">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={user.photoURL || undefined} />
                          <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <CardTitle className="text-lg">{user.displayName || 'N/A'}</CardTitle>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 break-all"><Mail className="h-3.5 w-3.5 shrink-0"/>{user.email || 'No Email'}</p>
                        </div>
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => { setSelectedUserForDetails(user); setIsDetailModalOpen(true); }}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {status !== 'active' && (
                                <DropdownMenuItem onClick={() => setUserToUpdate({ user, status: 'active' })}><ShieldCheck className="mr-2 h-4 w-4 text-green-500" /> Reactivate</DropdownMenuItem>
                              )}
                              {status === 'active' && (
                                <DropdownMenuItem onClick={() => setUserToUpdate({ user, status: 'suspended' })} className="text-yellow-600 focus:bg-yellow-100 focus:text-yellow-700"><ShieldOff className="mr-2 h-4 w-4" /> Suspend</DropdownMenuItem>
                              )}
                              {status !== 'deactivated' && (
                                <DropdownMenuItem onClick={() => setUserToUpdate({ user, status: 'deactivated' })} className="text-red-600 focus:bg-red-100 focus:text-red-700"><UserCog className="mr-2 h-4 w-4" /> Deactivate</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant={statusStyle.variant} className={cn('capitalize', statusStyle.className)}>{status}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground font-medium">Details</p>
                          <div className="pl-2 border-l-2 text-foreground/90 space-y-1">
                            <p><span className="font-semibold">Registered:</span> {user.createdAt ? format(user.createdAt instanceof Timestamp ? user.createdAt.toDate() : new Date(user.createdAt as any), "MMM d, yyyy") : 'N/A'}</p>
                            <p><span className="font-semibold">Provider:</span> {user.provider || 'Unknown'}</p>
                            <p className="flex items-start"><span className="font-semibold shrink-0 mr-1">UID:</span> <span className="truncate">{user.uid}</span></p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Modals and Dialogs */}
      <UserDetailModal user={selectedUserForDetails} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />

      {userToUpdate && (
        <AlertDialog open={!!userToUpdate} onOpenChange={() => setUserToUpdate(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to {userToUpdate.status} the account for <strong>{userToUpdate.user.displayName}</strong>.
                {userToUpdate.status === 'deactivated' && " This action is not easily reversible."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUpdatingStatus}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpdateStatus} disabled={isUpdatingStatus} className={cn(userToUpdate.status === 'active' ? 'bg-primary' : 'bg-destructive', 'text-destructive-foreground')}>
                {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm {userToUpdate.status.charAt(0).toUpperCase() + userToUpdate.status.slice(1)}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

