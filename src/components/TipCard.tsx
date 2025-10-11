"use client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Target } from "lucide-react";

interface TipCardProps {
  stockName: string;
  action: "BUY" | "SELL";
  entryPrice: string | number;
  targetPrice: string | number;
  stopLoss: string | number;
  timeframe: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  locked?: boolean;
}

const TipCard = ({
  stockName,
  action,
  entryPrice,
  targetPrice,
  stopLoss,
  timeframe,
  confidence,
  locked = false,
}: TipCardProps) => {
  return (
    <Card
      className={`relative p-6 hover:shadow-lg transition-all ${
        locked ? "blur-sm select-none" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{stockName}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant={action === "BUY" ? "default" : "destructive"}
              className={
                action === "BUY" ? "bg-success hover:bg-success/90" : ""
              }
            >
              {action === "BUY" ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {action}
            </Badge>
            <Badge variant="outline">{confidence}</Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{timeframe}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Entry Price</p>
          <p className="text-lg font-semibold text-foreground">₹{entryPrice}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4 text-success" />
            <p className="text-sm text-muted-foreground">Target</p>
          </div>
          <p className="text-lg font-semibold text-success">₹{targetPrice}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Stop Loss</p>
          <p className="text-lg font-semibold text-destructive">₹{stopLoss}</p>
        </div>
      </div>

      {locked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">
              Subscribe to unlock
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TipCard;
