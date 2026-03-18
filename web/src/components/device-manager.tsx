"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DeviceManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Manager</CardTitle>
        <CardDescription>
          Manage your IoT devices and their configurations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No devices registered yet</p>
        </div>
      </CardContent>
    </Card>
  );
}
