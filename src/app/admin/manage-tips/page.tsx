// app/admin/manage-tips/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Tip {
  _id: string;
  category: string;
  stockName: string;
  action: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  confidence: string;
  isDemo: boolean;
  createdAt: string;
}

const ManageTipsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [tips, setTips] = useState<Tip[]>([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: "equity",
    stockName: "",
    action: "",
    entryPrice: "",
    targetPrice: "",
    stopLoss: "",
    timeframe: "",
    confidence: "",
    isDemo: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  // Fetch tips when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchTips();
    }
  }, [status]);

  const fetchTips = async () => {
    setLoadingTips(true);
    try {
      const res = await fetch("/api/tips");
      if (!res.ok) throw new Error("Failed to fetch tips");
      const data: Tip[] = await res.json();
      setTips(data);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to load tips",
      });
    } finally {
      setLoadingTips(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          stock_name: formData.stockName,
          action: formData.action,
          entry_price: parseFloat(formData.entryPrice),
          target_price: parseFloat(formData.targetPrice),
          stop_loss: parseFloat(formData.stopLoss),
          timeframe: formData.timeframe,
          confidence: formData.confidence,
          isDemo: formData.isDemo,
        }),
      });

      if (!res.ok) throw new Error("Failed to post tip");

      toast({ title: "Success", description: "Tip posted successfully!" });
      setFormData({
        category: "equity",
        stockName: "",
        action: "",
        entryPrice: "",
        targetPrice: "",
        stopLoss: "",
        timeframe: "",
        confidence: "",
        isDemo: false,
      });

      fetchTips();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post tip",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tips?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete tip");
      toast({ title: "Success", description: "Tip deleted successfully" });
      fetchTips();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tip",
      });
    }
  };

  if (status === "loading" || loadingTips) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Admin Panel
        </h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Post New Tip */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Post New Tip
              </CardTitle>
              <CardDescription>
                Add a new stock tip for your subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="futures">Futures</SelectItem>
                      <SelectItem value="options">Options</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock & Action */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stockName">Stock Name</Label>
                    <Input
                      id="stockName"
                      value={formData.stockName}
                      onChange={(e) =>
                        setFormData({ ...formData, stockName: e.target.value })
                      }
                      placeholder="AAPL"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="action">Action</Label>
                    <Select
                      value={formData.action}
                      onValueChange={(value) =>
                        setFormData({ ...formData, action: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                        <SelectItem value="WATCH">WATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryPrice">Entry Price</Label>
                    <Input
                      id="entryPrice"
                      type="number"
                      step="0.01"
                      value={formData.entryPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, entryPrice: e.target.value })
                      }
                      placeholder="150.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetPrice">Target</Label>
                    <Input
                      id="targetPrice"
                      type="number"
                      step="0.01"
                      value={formData.targetPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetPrice: e.target.value,
                        })
                      }
                      placeholder="165.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">Stop Loss</Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      step="0.01"
                      value={formData.stopLoss}
                      onChange={(e) =>
                        setFormData({ ...formData, stopLoss: e.target.value })
                      }
                      placeholder="145.00"
                      required
                    />
                  </div>
                </div>

                {/* Timeframe & Confidence */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <Input
                      id="timeframe"
                      value={formData.timeframe}
                      onChange={(e) =>
                        setFormData({ ...formData, timeframe: e.target.value })
                      }
                      placeholder="1-2 weeks"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confidence">Confidence</Label>
                    <Select
                      value={formData.confidence}
                      onValueChange={(value) =>
                        setFormData({ ...formData, confidence: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Demo */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDemo"
                    checked={formData.isDemo}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isDemo: checked as boolean })
                    }
                  />
                  <Label htmlFor="isDemo" className="cursor-pointer">
                    Make this tip available to free users (Demo Tip)
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Post Tip
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tips</CardTitle>
              <CardDescription>Manage your posted tips</CardDescription>
            </CardHeader>
            <CardContent>
              {tips.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No tips posted yet
                </p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {tips.map((tip) => (
                    <div
                      key={tip._id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">
                            {tip.category.toUpperCase()}
                          </span>
                          <span className="font-bold">{tip.stockName}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              tip.action === "BUY"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {tip.action}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground grid grid-cols-2 gap-1">
                          <span>Entry: ₹{tip.entryPrice}</span>
                          <span>Target: ₹{tip.targetPrice}</span>
                          <span>Stop Loss: ₹{tip.stopLoss}</span>
                          <span>Confidence: {tip.confidence}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tip._id)}
                        className="text-destructive hover:text-destructive"
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
};

export default ManageTipsPage;
