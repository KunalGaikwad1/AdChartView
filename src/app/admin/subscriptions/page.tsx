"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

export default function ManagePlans() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  // Protect route
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
    else if (session.user.role !== "admin") router.push("/");
  }, [session, status, router]);

  useEffect(() => {
    if (status === "authenticated") fetchPlans();
  }, [status]);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/subscriptions");
      const data = await res.json();
      setPlans(data);
    } catch {
      toast({ title: "Error", description: "Failed to load plans" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          duration: form.duration,
          description: form.description,
        }),
      });
      if (!res.ok) throw new Error("Failed to add plan");
      toast({ title: "Plan added successfully!" });
      setForm({ name: "", price: "", duration: "", description: "" });
      fetchPlans();
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/subscriptions?id=${id}`, { method: "DELETE" });
    fetchPlans();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-10">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Manage Subscription Plans
        </h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Add Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Premium Plan"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="999"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    placeholder="1 Month / 3 Months / 1 Year"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Includes daily premium tips and alerts"
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Plan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Plans</CardTitle>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  No plans available.
                </p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {plans.map((plan) => (
                    <div
                      key={plan._id}
                      className="p-4 border rounded-lg flex justify-between items-start"
                    >
                      <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ₹{plan.price} • {plan.duration}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {plan.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(plan._id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
