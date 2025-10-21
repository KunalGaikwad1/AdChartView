"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ location: "", age: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const router = useRouter();

  const sendOTP = async () => {
    const res = await fetch("/api/twilio/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: form.phone }),
    });
    const data = await res.json();
    if (data.success) {
      setOtpSent(true);
      alert("OTP sent to your mobile.");
    } else {
      alert(data.error || "Failed to send OTP");
    }
  };

  const verifyOTP = async () => {
    const res = await fetch("/api/twilio/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: form.phone, code: otp }),
    });
    const data = await res.json();
    if (data.success) {
      setOtpVerified(true);
      alert("OTP verified.");
    } else {
      alert(data.error || "Invalid OTP");
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!otpVerified) {
    alert("Please verify your phone number first.");
    return;
  }

  setSaving(true);
  try {
    const res = await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error("Failed to update profile");

    // ✅ Dispatch custom event
    window.dispatchEvent(new Event("profileUpdated"));

    router.push("/"); // Navigate after update
  } finally {
    setSaving(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  disabled={otpVerified}
                />
                <Button
                  type="button"
                  onClick={sendOTP}
                  disabled={otpSent || otpVerified}
                >
                  {otpVerified ? "Verified" : otpSent ? "Sent" : "Send OTP"}
                </Button>
              </div>
            </div>

            {otpSent && !otpVerified && (
              <div>
                <Label>Enter OTP</Label>
                <div className="flex gap-2">
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                  />
                  <Button type="button" onClick={verifyOTP}>
                    Verify OTP
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={saving || !otpVerified}
            >
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
