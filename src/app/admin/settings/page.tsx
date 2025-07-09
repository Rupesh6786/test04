
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Settings, CreditCard, Bell, Key, Save, Mail, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Demo placeholder for Razorpay Key
const RAZORPAY_KEY_ID_PLACEHOLDER = "rzp_test_lw1YZ20Ss4PtqR";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  
  // State for Payment Gateway settings
  const [razorpayKey, setRazorpayKey] = useState(RAZORPAY_KEY_ID_PLACEHOLDER);
  const [razorpaySecret, setRazorpaySecret] = useState("••••••••••••••••••••");

  // State for Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@example.com");

  const handleSaveChanges = (section: string) => {
    toast({
      title: "Settings Saved (Demo)",
      description: `Your ${section} settings have been saved. This is a demo and the values have not been changed.`,
    });
  };
  
  const handleSendTestNotification = (type: 'Email' | 'SMS') => {
    toast({
      title: `Sending Test ${type}`,
      description: `A test ${type.toLowerCase()} is being sent. (This is a demo feature).`
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
      </div>
      
      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment"><CreditCard className="mr-2 h-4 w-4" /> Payment Gateway</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="general"><Settings className="mr-2 h-4 w-4" /> General</TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Key className="mr-2 h-5 w-5"/> Razorpay Configuration</CardTitle>
              <CardDescription>
                Manage the API keys for your Razorpay payment gateway. These keys are used for processing online payments for both services and products.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="razorpay-key">Key ID</Label>
                <Input id="razorpay-key" value={razorpayKey} onChange={(e) => setRazorpayKey(e.target.value)} />
                <p className="text-sm text-muted-foreground">
                  Your public Razorpay Key ID.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="razorpay-secret">Key Secret</Label>
                <Input id="razorpay-secret" type="password" value={razorpaySecret} onChange={(e) => setRazorpaySecret(e.target.value)} />
                 <p className="text-sm text-muted-foreground">
                  Your private Razorpay Key Secret. It is hidden for security.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveChanges('payment gateway')}>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications for new bookings, enquiries, and orders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications" className="flex items-center gap-2 font-semibold text-base"><Mail className="h-5 w-5"/> Email Notifications</Label>
                        <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Receive email alerts for important events.</p>
                    {emailNotifications && (
                        <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="admin-email">Admin Recipient Email</Label>
                                <Input id="admin-email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                            </div>
                             <Button variant="outline" size="sm" onClick={() => handleSendTestNotification('Email')}>Send Test Email</Button>
                        </div>
                    )}
                </div>
                 <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="sms-notifications" className="flex items-center gap-2 font-semibold text-base"><MessageSquare className="h-5 w-5"/> SMS Notifications</Label>
                        <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Receive SMS alerts (requires a third-party SMS provider).</p>
                    {smsNotifications && (
                        <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="sms-api-key">SMS Provider API Key</Label>
                                <Input id="sms-api-key" type="password" defaultValue="demo_sms_api_key" />
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleSendTestNotification('SMS')}>Send Test SMS</Button>
                        </div>
                    )}
                </div>
            </CardContent>
             <CardFooter>
                <Button onClick={() => handleSaveChanges('notification')}>
                    <Save className="mr-2 h-4 w-4" /> Save Notification Settings
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="general" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>General Configuration</CardTitle>
                    <CardDescription>
                        Manage general settings and parameters for the application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground">
                    Future functionality in this section could include:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                    <li>Site information (name, contact details).</li>
                    <li>Managing admin user accounts (if more complex role management is needed).</li>
                    <li>Setting default service prices or price ranges for admin review.</li>
                    <li>Global theme customization options.</li>
                </ul>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
