import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck2, DollarSign, Users } from "lucide-react";

export const NotificationsView = () => (
  <Card>
    <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
    <CardContent>
      <ul className="space-y-4">
        <li className="flex items-start gap-3">
          <FileCheck2 className="h-5 w-5 text-green-500 mt-1" />
          <div>
            <p className="font-medium">Campaign Approved</p>
            <p className="text-sm text-muted-foreground">Your "Winter Blanket Drive" campaign is now live. (2 days ago)</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-blue-500 mt-1" />
          <div>
            <p className="font-medium">New Donation</p>
            <p className="text-sm text-muted-foreground">You received a donation of ₹5,000 for "Winter Blanket Drive". (3 hours ago)</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <Users className="h-5 w-5 text-purple-500 mt-1" />
          <div>
            <p className="font-medium">Worker Invitation Accepted</p>
            <p className="text-sm text-muted-foreground">Sunita Sharma has joined your team as a Distributor. (1 day ago)</p>
          </div>
        </li>
      </ul>
    </CardContent>
  </Card>
);