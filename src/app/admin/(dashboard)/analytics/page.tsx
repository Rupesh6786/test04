
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            This section will display key performance indicators and reports for the business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Future functionality will include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>Sales trends (e.g., revenue over time, top-selling products).</li>
            <li>Service popularity (e.g., most booked services).</li>
            <li>User growth and engagement metrics.</li>
            <li>Appointment statistics (e.g., completion rates, pending payments).</li>
            <li>Interactive charts and graphs for data visualization.</li>
            <li>Options to export reports (e.g., CSV, PDF).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
