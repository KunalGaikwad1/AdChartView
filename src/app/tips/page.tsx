"use client";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import TipCard from "@/components/TipCard";

interface Tip {
  _id: string;
  category: "equity" | "futures" | "options";
  stockName: string;
  action: "BUY" | "SELL" | string;
  entryPrice: number;
  targetPrice: string;
  stopLoss: number;
  timeframe: string;
  createdAt: string;
  note: string;
  isDemo: boolean;
}

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await fetch("/api/tips");
        if (!res.ok) throw new Error("Failed to fetch tips");
        const data = await res.json();
        setTips(data);
        setIsSubscribed(!data.some((t: Tip) => t.isDemo)); // if only demo tips, user unsubscribed
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  const equityTips = tips.filter((t) => t.category === "equity");
  const futureTips = tips.filter((t) => t.category === "futures");
  const optionTips = tips.filter((t) => t.category === "options");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Today&apos;s Premium Tips
            </h1>
            <p className="text-base md:text-xl text-muted-foreground">
              Expert stock market insights across equity, futures, and options
            </p>
          </div>

          {!isSubscribed && (
            <div className="bg-gradient-to-r from-accent/10 to-success/10 border border-accent/20 rounded-xl p-4 sm:p-6 text-center mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3">
                <Lock className="h-6 w-6 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">
                  Viewing Demo Tips
                </h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                You&apos;re viewing free demo tips. Subscribe to get unlimited
                access to all premium tips!
              </p>
              <Link href="/pricing">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 w-full sm:w-auto"
                >
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          )}

          <Tabs defaultValue="equity" className="w-full">
            <TabsList className="mb-6 md:mb-8 h-auto bg-muted overflow-x-auto rounded-lg p-1 md:p-2 lg:p-2.5 flex md:grid md:grid-cols-3 gap-2 md:gap-3 lg:gap-4 md:max-w-3xl md:mx-auto">
              <TabsTrigger
                value="equity"
                className="text-sm md:text-base py-2 md:py-3 lg:py-3.5 whitespace-nowrap shrink-0 w-auto md:w-full justify-center"
              >
                Equity Calls ({equityTips.length})
              </TabsTrigger>
              <TabsTrigger
                value="futures"
                className="text-sm md:text-base py-2 md:py-3 lg:py-3.5 whitespace-nowrap shrink-0 w-auto md:w-full justify-center"
              >
                Future Calls ({futureTips.length})
              </TabsTrigger>
              <TabsTrigger
                value="options"
                className="text-sm md:text-base py-2 md:py-3 lg:py-3.5 whitespace-nowrap shrink-0 w-auto md:w-full justify-center"
              >
                Options Calls ({optionTips.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="equity"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[40vh]"
            >
              {equityTips.map((tip) => (
                <TipCard
                  key={tip._id}
                  stockName={tip.stockName}
                  action={tip.action as "BUY" | "SELL"}
                  entryPrice={tip.entryPrice}
                  targetPrice={tip.targetPrice}
                  stopLoss={tip.stopLoss}
                  timeframe={tip.timeframe}
                  createdAt={tip.createdAt}
                  note={tip.note}
                />
              ))}
            </TabsContent>

            <TabsContent
              value="futures"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[40vh]"
            >
              {futureTips.map((tip) => (
                <TipCard
                  key={tip._id}
                  stockName={tip.stockName}
                  action={tip.action as "BUY" | "SELL"}
                  entryPrice={tip.entryPrice}
                  targetPrice={tip.targetPrice}
                  stopLoss={tip.stopLoss}
                  timeframe={tip.timeframe}
                  createdAt={tip.createdAt}
                  note={tip.note}
                />
              ))}
            </TabsContent>

            <TabsContent
              value="options"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[40vh]"
            >
              {optionTips.map((tip) => (
                <TipCard
                  key={tip._id}
                  stockName={tip.stockName}
                  action={tip.action as "BUY" | "SELL"}
                  entryPrice={tip.entryPrice}
                  targetPrice={tip.targetPrice}
                  stopLoss={tip.stopLoss}
                  timeframe={tip.timeframe}
                  createdAt={tip.createdAt}
                  note={tip.note}
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
