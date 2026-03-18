'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Overview } from '@/components/overview';
import { DeviceManager } from '@/components/device-manager';
import { SessionManager } from '@/components/session-manager';
import { IdentityManager } from '@/components/identity-manager';
import { AccountBalance } from '@/components/account-balance';
import { ActivityFeed } from '@/components/activity-feed';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IoT Stellar Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your IoT devices, payments, and decentralized identities on Stellar
          </p>
        </div>
        <AccountBalance />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Overview />
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <DeviceManager />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <SessionManager />
        </TabsContent>

        <TabsContent value="identity" className="space-y-4">
          <IdentityManager />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <ActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
