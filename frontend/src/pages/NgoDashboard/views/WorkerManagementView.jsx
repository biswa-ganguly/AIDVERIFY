import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

export const WorkerManagementView = () => {
  const [workers, setWorkers] = useState([
    { id: 1, name: "Sunita Sharma", email: "worker1@email.com", role: "Distributor", status: "Active", campaign: "Winter Blanket Drive" },
    { id: 2, name: "Rajesh Kumar", email: "worker2@email.com", role: "Verifier", status: "Active", campaign: "Educate a Child Program" },
    { id: 3, name: "N/A", email: "new.invite@email.com", role: "Unassigned", status: "Pending", campaign: "N/A" }
  ]);

  const [newWorkerEmail, setNewWorkerEmail] = useState("");
  const [newWorkerRole, setNewWorkerRole] = useState("");
  const [assignedCampaign, setAssignedCampaign] = useState("");
  
  const availableRoles = ["Distributor", "Verifier", "Coordinator"];
  const availableCampaigns = ["Winter Blanket Drive", "Educate a Child Program", "Community Kitchen Setup"];

  const removeWorker = (id) => setWorkers(workers.filter((w) => w.id !== id));

  const handleSendInvite = () => {
    if (!newWorkerEmail || !newWorkerRole || !assignedCampaign) {
      alert("Please fill in all fields to send an invite.");
      return;
    }
    console.log("Inviting worker:", { email: newWorkerEmail, role: newWorkerRole, campaign: assignedCampaign });
    alert(`Invite sent to ${newWorkerEmail}!`);
    setNewWorkerEmail("");
    setNewWorkerRole("");
    setAssignedCampaign("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Worker Management</CardTitle>
        <CardDescription>Add, view, and manage your on-ground team members and assign them to campaigns.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 mb-6 space-y-4">
          <h3 className="font-semibold">Invite New Worker</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="email" placeholder="Worker's email" value={newWorkerEmail} onChange={(e) => setNewWorkerEmail(e.target.value)} />
            
            <select
              value={newWorkerRole}
              onChange={(e) => setNewWorkerRole(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Select a role</option>
              {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>

            <select
              value={assignedCampaign}
              onChange={(e) => setAssignedCampaign(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Select a campaign</option>
              {availableCampaigns.map(campaign => <option key={campaign} value={campaign}>{campaign}</option>)}
            </select>
          </div>
          <Button onClick={handleSendInvite}>Send Invite</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell className="font-medium">{worker.name}</TableCell>
                <TableCell>{worker.role}</TableCell>
                <TableCell>{worker.campaign}</TableCell>
                <TableCell><Badge variant={worker.status === 'Active' ? 'default' : 'secondary'}>{worker.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="icon" onClick={() => removeWorker(worker.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};