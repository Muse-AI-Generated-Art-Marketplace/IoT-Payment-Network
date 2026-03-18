"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountBalance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Balance</CardTitle>
        <CardDescription>
          Your current Stellar account balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">1,000 XLM</div>
      </CardContent>
    </Card>
  );
}
