"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import Link from "next/link";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
  <div className="absolute inset-0 bg-gradient-to-br from-background/55 via-background/40 to-background/55" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Tagline */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-primary mb-4">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">
              Premium Stock Market Insights
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            AdChartView — Stock Tips Platform
            <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-[length:200%_200%] animate-gradient bg-clip-text text-transparent drop-shadow-lg">
              Delivered Daily
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get expert equity, futures, and options calls from seasoned market
            professionals. Make informed decisions with our premium research and
            analysis.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/pricing">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 text-lg px-8 py-6"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/tips">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 text-lg px-8 py-6"
              >
                View Sample Tips
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 backdrop-blur border border-border">
                  <div className="p-3 rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/25">
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-foreground">Expert Analysis</h3>
              <p className="text-sm text-muted-foreground text-center">
                Professional insights from experienced traders
              </p>
            </div>

                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 backdrop-blur border border-border">
                  <div className="p-3 rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/25">
                    <Zap className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-foreground">
                Real-time Updates
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Get tips instantly as market opportunities arise
              </p>
            </div>

                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/50 backdrop-blur border border-border">
                  <div className="p-3 rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/25">
                    <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-foreground">
                Verified Track Record
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Proven accuracy with transparent performance history
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
