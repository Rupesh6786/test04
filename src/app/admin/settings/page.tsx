
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Application Configuration</CardTitle>
          <CardDescription>
            Manage general settings and parameters for the Classic-Solution application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Future functionality will include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>Site information (name, contact details - though some are hardcoded currently).</li>
            <li>Payment gateway configuration (e.g., managing Razorpay keys - currently hardcoded).</li>
            <li>Notification settings (if email/SMS notifications are added).</li>
            <li>Managing admin user accounts (if more complex role management is needed beyond UIDs).</li>
            <li>Setting default service prices or price ranges for admin review.</li>
            <li>Theme customization options.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
