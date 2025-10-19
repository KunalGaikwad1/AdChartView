"use client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface TipCardProps {
  stockName: string;
  action: "BUY" | "SELL";
  entryPrice: string | number;
  targetPrice: string | number;
  stopLoss: string | number;
  timeframe: string;
  createdAt: string;
  note: string;
  locked?: boolean;
}

const TipCard = ({
  stockName,
  action,
  entryPrice,
  targetPrice,
  stopLoss,
  timeframe,
  createdAt,
  note,
  locked = false,
}: TipCardProps) => {
  const formattedDate = new Date(createdAt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      className={`relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-background via-background to-muted/40 p-6 shadow-md transition-all hover:shadow-xl ${
        locked ? "blur-sm select-none" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {stockName}
          </h3>
          <div className="flex items-center gap-2 mt-3">
            <Badge
              className={`flex items-center px-3 py-1 text-sm font-medium ${
                action === "BUY"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              {action === "BUY" ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {action}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs border-muted-foreground/30 text-muted-foreground "
            >
              {timeframe}
            </Badge>
          </div>
        </div>

        <div className="text-right text-sm text-muted-foreground">
          <div className="flex items-center justify-end gap-1 mb-1">
            <Clock className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-3 gap-4 text-center mt-4">
        {/* Entry */}
        <div className="bg-muted/20 rounded-lg py-3 px-2">
          <p className="text-xs uppercase text-muted-foreground font-medium">
            ENTRY
          </p>
          <p className="text-lg font-semibold text-foreground mt-1">
            ₹{entryPrice}
          </p>
        </div>

        {/* Target */}
        <div className="rounded-lg py-3 px-2 bg-emerald-950/40 border border-emerald-600/30">
          <p className="flex justify-center items-center text-xs uppercase font-medium text-emerald-400">
            <Target className="h-3.5 w-3.5 mr-1" /> TARGET
          </p>
          <p className="text-base font-semibold text-emerald-300 mt-1 break-words leading-snug">
            ₹{targetPrice}
          </p>
        </div>

        {/* Stop Loss */}
        <div className="rounded-lg py-3 px-2 bg-red-950/40 border border-red-600/30">
          <p className="flex justify-center items-center text-xs uppercase font-medium text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" /> STOP LOSS
          </p>
          <p className="text-base font-semibold text-red-300 mt-1 leading-snug">
            ₹{stopLoss}
          </p>
        </div>
      </div>

      {/* Note */}
      <div className="mt-6 border-t border-border/30 pt-4">
        <h4 className="text-sm font-semibold text-foreground mb-1">Note:</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{note}</p>
      </div>

      {/* Locked overlay */}
      {locked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
          <Lock className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-lg font-semibold text-foreground">
            Subscribe to unlock
          </p>
        </div>
      )}
    </Card>
  );
};

export default TipCard;
