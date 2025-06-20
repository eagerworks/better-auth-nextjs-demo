"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { twoFactor } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const { enable, disable, verifyTotp } = twoFactor;

interface TwoFactorSettingsProps {
  user: {
    twoFactorEnabled?: boolean | null;
  };
}

export function TwoFactorSettings({ user }: TwoFactorSettingsProps) {
  const [showEnableFlow, setShowEnableFlow] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Enable 2FA using Better Auth client method
  const handleEnable2FA = async (password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await enable({
        password,
        issuer: "Better Auth Next.js Demo",
      });

      if (error) {
        if (
          error.message?.includes("password") ||
          error.message?.includes("credentials")
        ) {
          toast.error(
            "Invalid password or no password set. If you signed up with GitHub, you may need to set a password first."
          );
        } else {
          toast.error(error.message || "Failed to enable 2FA");
        }
        return;
      }

      if (data) {
        setQrCodeUri(data.totpURI);
        setBackupCodes(data.backupCodes);
        setShowQRCode(true);
        toast.success(
          "2FA enabled! Please scan the QR code with your authenticator app."
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to enable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify TOTP using Better Auth client method
  const handleVerifyTOTP = async (code: string) => {
    setIsLoading(true);
    try {
      await verifyTotp({ code });

      toast.success("2FA verified successfully!");
      setShowEnableFlow(false);
      setShowQRCode(false);
      router.refresh(); // Refresh to update the UI
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  // Disable 2FA using Better Auth client method
  const handleDisable2FA = async (password: string) => {
    setIsLoading(true);
    try {
      await disable({ password });

      toast.success("2FA disabled successfully");
      router.refresh(); // Refresh to update the UI
    } catch (error: any) {
      toast.error(error.message || "Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔐 Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              Status:{" "}
              {user.twoFactorEnabled ? (
                <span className="text-green-600">Enabled</span>
              ) : (
                <span className="text-red-600">Disabled</span>
              )}
            </p>
            <p className="text-sm text-gray-600">
              {user.twoFactorEnabled
                ? "Your account is protected with 2FA"
                : "Add an extra layer of security"}
            </p>
          </div>
        </div>

        {!user.twoFactorEnabled && !showEnableFlow && (
          <div className="space-y-3">
            <Button onClick={() => setShowEnableFlow(true)} className="w-full">
              Enable 2FA
            </Button>
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> If you signed up with GitHub OAuth,
                you'll need to set a password first before enabling 2FA.
              </p>
            </div>
          </div>
        )}

        {!user.twoFactorEnabled && showEnableFlow && !showQRCode && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const password = formData.get("password") as string;
              if (password) {
                await handleEnable2FA(password);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="enable-password">Password</Label>
              <Input
                id="enable-password"
                name="password"
                type="password"
                placeholder="Enter your account password"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Required to verify your identity before enabling 2FA
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Enabling..." : "Enable 2FA"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEnableFlow(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {showQRCode && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="font-medium mb-2">
                Scan this QR code with your authenticator app:
              </p>
              {qrCodeUri && (
                <div className="flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      qrCodeUri
                    )}`}
                    alt="2FA QR Code"
                    className="border rounded"
                  />
                </div>
              )}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const code = formData.get("code") as string;
                if (code) {
                  await handleVerifyTOTP(code);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="verify-code">Verification Code</Label>
                <Input
                  id="verify-code"
                  name="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Verifying..." : "Verify & Complete Setup"}
              </Button>
            </form>

            {backupCodes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="font-medium text-yellow-800 mb-2">
                  Backup Codes (save these!):
                </p>
                <div className="grid grid-cols-2 gap-1 text-sm font-mono">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-white px-2 py-1 rounded border"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {user.twoFactorEnabled && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const password = formData.get("password") as string;
              if (password) {
                await handleDisable2FA(password);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="disable-password">Password</Label>
              <Input
                id="disable-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
            </div>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Disabling..." : "Disable 2FA"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
