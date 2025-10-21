"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileStatusModalProps {
  open: boolean;
  onClose: () => void;
  completed: boolean;
}

export default function ProfileStatusModal({
  open,
  onClose,
  completed,
}: ProfileStatusModalProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center space-y-4">
        <DialogHeader>
          <DialogTitle>Profile Status</DialogTitle>
        </DialogHeader>

        {completed ? (
          <>
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
            <p className="text-muted-foreground">
              Your profile is already completed.
            </p>
            <Button onClick={onClose}>Close</Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground">
              Your profile is incomplete. Please complete your details to access all features.
            </p>
            <Button
              onClick={() => {
                onClose();
                router.push("/user/profile");
              }}
              className="w-full"
            >
              Complete Now
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
