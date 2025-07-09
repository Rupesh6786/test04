
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, DollarSign, ListChecks, Download } from "lucide-react";

// --- Demo Data ---

const monthlyRevenueData = [
  { month: 'Jan', revenue: 40000 },
  { month: 'Feb', revenue: 30000 },
  { month: 'Mar', revenue: 50000 },
  { month: 'Apr', revenue: 45000 },
  { month: 'May', revenue: 60000 },
  { month: 'Jun', revenue: 75000 },
];

const topSellingProductsData = [
  { name: 'CoolWave X2000', sales: 125 },
  { name: 'ArcticBlast Pro', sales: 98 },
  { name: 'FrostFlow Eco', sales: 75 },
  { name: 'ChillMaster Mini', sales: 50 },
];

const servicePopularityData = [
  { name: 'Dry Service', bookings: 210 },
  { name: 'Gas Charging', bookings: 180 },
  { name: 'AC Installation', bookings: 150 },
  { name: 'Z Service', bookings: 95 },
  { name: 'PCB Repair', bookings: 60 },
];

const appointmentStatusData = [
  { name: 'Completed', value: 450, color: '#22c55e' }, // green-500
  { name: 'Confirmed', value: 120, color: '#3b82f6' }, // blue-500
  { name: 'Payment Pending', value: 80, color: '#f59e0b' }, // amber-500
  { name: 'Cancelled', value: 45, color: '#ef4444' }, // red-500
];

const userGrowthData = [
  { month: 'Jan', users: 50 },
  { month: 'Feb', users: 65 },
  { month: 'Mar', users: 90 },
  { month: 'Apr', users: 110 },
  { month: 'May', users: 150 },
  { month: 'Jun', users: 210 },
];


export default function AdminAnalyticsPage() {
  const handleExport = (reportName: string) => {
    // In a real app, this would trigger a download of a CSV/PDF file.
    alert(`Exporting ${reportName} report... (demo)`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
        </div>
        <Button onClick={() => handleExport('Full Dashboard')}>
          <Download className="mr-2 h-4 w-4" />
          Export Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign /> Monthly Revenue</CardTitle>
            <CardDescription>Revenue trends for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> User Growth</CardTitle>
            <CardDescription>New user registrations over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" name="New Users" stroke="hsl(var(--accent))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Units sold for the most popular products.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSellingProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value} units sold`} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" background={{ fill: 'hsl(var(--muted))' }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Popularity */}
        <Card>
          <CardHeader>
            <CardTitle>Service Popularity</CardTitle>
            <CardDescription>Total bookings for the most requested services.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={servicePopularityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value} bookings`} />
                <Bar dataKey="bookings" fill="hsl(var(--accent))" background={{ fill: 'hsl(var(--muted))' }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

         {/* Appointment Status */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListChecks /> Appointment Status Distribution</CardTitle>
                <CardDescription>A breakdown of all appointment statuses.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={appointmentStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {appointmentStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} appointments`, name]} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
