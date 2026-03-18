"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SessionManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Manager</CardTitle>
        <CardDescription>
          Monitor and manage your payment sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No active sessions</p>
        </div>
      </CardContent>
    </Card>
  );
}
