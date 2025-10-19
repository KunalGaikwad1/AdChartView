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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2, Pencil } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Tip {
  _id: string;
  category: string;
  stockName: string;
  action: string;
  entryPrice: number;
  targetPrice: string;
  stopLoss: number;
  timeframe: string;
  note: string;
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
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    category: "equity",
    stockName: "",
    action: "",
    entryPrice: "",
    targetPrice: "",
    stopLoss: "",
    timeframe: "",
    note: "",
    isDemo: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") fetchTips();
  }, [status]);

  const fetchTips = async () => {
    setLoadingTips(true);
    try {
      const res = await fetch("/api/tips");
      if (!res.ok) throw new Error("Failed to fetch tips");
      const data: Tip[] = await res.json();
      setTips(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
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
          target_price: formData.targetPrice,
          stop_loss: parseFloat(formData.stopLoss),
          timeframe: formData.timeframe,
          note: formData.note,
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
        note: "",
        isDemo: false,
      });
      fetchTips();
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tips?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete tip");
      toast({ title: "Deleted", description: "Tip deleted successfully" });
      fetchTips();
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    }
  };

  const handleUpdate = async () => {
    if (!editingTip) return;
    setUpdating(true);

    try {
      const res = await fetch("/api/tips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTip._id,
          category: editingTip.category,
          stock_name: editingTip.stockName,
          action: editingTip.action,
          entry_price: editingTip.entryPrice,
          target_price: editingTip.targetPrice,
          stop_loss: editingTip.stopLoss,
          timeframe: editingTip.timeframe,
          note: editingTip.note,
          isDemo: editingTip.isDemo,
        }),
      });

      if (!res.ok) throw new Error("Failed to update tip");
      const updatedTip = await res.json();

      fetchTips();

      toast({ title: "Updated", description: "Tip updated successfully!" });
      setEditingTip(null);
      setIsDialogOpen(false); // ✅ Close dialog
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    } finally {
      setUpdating(false);
    }
  };

  if (status === "loading" || loadingTips)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Manage Tips
        </h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Post New Tip */}
          <Card className="border-primary/10 shadow-md">
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
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="futures">Futures</SelectItem>
                      <SelectItem value="options">Options</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stock Name</Label>
                    <Input
                      value={formData.stockName}
                      onChange={(e) =>
                        setFormData({ ...formData, stockName: e.target.value })
                      }
                      placeholder="AAPL"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Select
                      value={formData.action}
                      onValueChange={(value) =>
                        setFormData({ ...formData, action: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                        <SelectItem value="WATCH">WATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Entry Price</Label>
                    <Input
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
                    <Label>Target Price</Label>
                    <Input
                      value={formData.targetPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetPrice: e.target.value,
                        })
                      }
                      placeholder="160/170"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stop Loss</Label>
                    <Input
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Timeframe</Label>
                    <Input
                      value={formData.timeframe}
                      onChange={(e) =>
                        setFormData({ ...formData, timeframe: e.target.value })
                      }
                      placeholder="1-2 weeks"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Note</Label>
                    <Input
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                      placeholder="Example: Watch for breakout"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.isDemo}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isDemo: checked as boolean })
                    }
                  />
                  <Label>Make this a demo tip for free users</Label>
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
          <Card className="border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle>Recent Tips</CardTitle>
              <CardDescription>
                Manage and update your posted tips
              </CardDescription>
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
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/40 transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">
                            {tip.category.toUpperCase()}
                          </span>
                          <span className="font-bold text-sm">
                            {tip.stockName}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              tip.action === "BUY"
                                ? "bg-green-500/10 text-green-600"
                                : tip.action === "SELL"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-blue-500/10 text-blue-600"
                            }`}
                          >
                            {tip.action}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Entry ₹{tip.entryPrice} — Target ₹{tip.targetPrice} —
                          SL ₹{tip.stopLoss}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tip.note}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {/* Edit Dialog */}
                        <Dialog
                          open={isDialogOpen}
                          onOpenChange={setIsDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTip(tip);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Edit Tip</DialogTitle>
                              <DialogDescription>
                                Modify the tip details and save changes
                              </DialogDescription>
                            </DialogHeader>

                            {editingTip && (
                              <div className="space-y-3 mt-3">
                                <Label>Stock Name</Label>
                                <Input
                                  value={editingTip.stockName}
                                  onChange={(e) =>
                                    setEditingTip({
                                      ...editingTip,
                                      stockName: e.target.value,
                                    })
                                  }
                                />

                                <Label>Action</Label>
                                <Select
                                  value={editingTip.action}
                                  onValueChange={(value) =>
                                    setEditingTip({
                                      ...editingTip,
                                      action: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="BUY">BUY</SelectItem>
                                    <SelectItem value="SELL">SELL</SelectItem>
                                    <SelectItem value="WATCH">WATCH</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Label>Target Price</Label>
                                <Input
                                  value={editingTip.targetPrice}
                                  onChange={(e) =>
                                    setEditingTip({
                                      ...editingTip,
                                      targetPrice: e.target.value,
                                    })
                                  }
                                />

                                <Label>Note</Label>
                                <Input
                                  value={editingTip.note}
                                  onChange={(e) =>
                                    setEditingTip({
                                      ...editingTip,
                                      note: e.target.value,
                                    })
                                  }
                                />

                                <DialogFooter>
                                  <Button
                                    onClick={handleUpdate}
                                    disabled={updating}
                                  >
                                    {updating ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      "Save Changes"
                                    )}
                                  </Button>
                                </DialogFooter>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tip._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
