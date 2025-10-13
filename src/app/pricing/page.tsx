"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/subscriptions");
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data = await res.json();
        setPlans(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const handlePayment = async (planId: string, amount: number, planName: string) => {
  const res = await loadRazorpayScript();
  if (!res) {
    alert("Razorpay SDK failed to load. Are you online?");
    return;
  }

  try {
    const orderRes = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const order = await orderRes.json();

  const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "AdChartView",
      description: `Subscription for ${planName}`,
      order_id: order.id,
      handler: async function (response: any) {
        await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planId,
          }),
        });
        alert("Payment successful!");
      },
      // Match site emerald theme
      theme: { color: "#10B981" },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  } catch (err) {
    console.error(err);
    alert("Payment initialization failed!");
  }
};



  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock premium stock market insights and exclusive daily calls with
            a plan that suits your trading style.
          </p>
        </div>

        {plans.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No subscription plans available yet.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan._id}
                className="border border-emerald-400/25 hover:border-emerald-400/40 transition shadow-sm hover:shadow-md"
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {plan.name}
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    {plan.duration}
                  </p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-emerald-400 mb-4">
                    ₹{plan.price}
                  </div>
                  <div className="text-sm text-muted-foreground mb-6">
                    {plan.description || "Access all premium features"}
                  </div>

                  {/* Features Section (Static Example) */}
                  <ul className="space-y-2 text-left mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-400" /> Daily
                      premium stock tips
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-400" /> Real-time
                      alerts and updates
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-400" /> Expert
                      analysis and insights
                    </li>
                  </ul>

                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => handlePayment(plan._id, plan.price, plan.name)}
                  >
                    Subscribe Now
                  </Button>

                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
