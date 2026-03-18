"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function IdentityManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity Manager</CardTitle>
        <CardDescription>
          Manage your decentralized identities and credentials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No DIDs created yet</p>
        </div>
      </CardContent>
    </Card>
  );
}
