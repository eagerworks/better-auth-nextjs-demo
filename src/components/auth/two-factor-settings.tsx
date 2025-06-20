"use client";

import { useState, useEffect, useActionState } from "react";
import { toast } from "sonner";
import {
  enable2FAAction,
  verify2FAAction,
  disable2FAAction,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { FORM_INITIAL_STATE } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TwoFactorSettingsProps {
  user: {
    twoFactorEnabled?: boolean | null;
  };
}

export function TwoFactorSettings({ user }: TwoFactorSettingsProps) {
  // Form states
  const [showEnableFlow, setShowEnableFlow] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Action states
  const [enableState, enableAction, isEnabling] = useActionState(
    enable2FAAction,
    FORM_INITIAL_STATE
  );
  const [verifyState, verifyAction, isVerifying] = useActionState(
    verify2FAAction,
    FORM_INITIAL_STATE
  );
  const [disableState, disableAction, isDisabling] = useActionState(
    disable2FAAction,
    FORM_INITIAL_STATE
  );

  // Handle enable 2FA success
  useEffect(() => {
    if (enableState.success && enableState.data) {
      setQrCodeUri(enableState.data.totpURI);
      setBackupCodes(enableState.data.backupCodes);
      setShowQRCode(true);
      toast.success(
        "2FA enabled! Please scan the QR code with your authenticator app."
      );
    } else if (enableState.error) {
      if (
        enableState.error.includes("password") ||
        enableState.error.includes("credentials")
      ) {
        toast.error(
          "Invalid password or no password set. If you signed up with GitHub, you may need to set a password first."
        );
      } else {
        toast.error(enableState.error);
      }
    }
  }, [enableState]);

  // Handle verify 2FA success
  useEffect(() => {
    if (verifyState.success) {
      toast.success("2FA verified successfully!");
      setShowEnableFlow(false);
      setShowQRCode(false);
      // The page will refresh automatically due to revalidatePath
    } else if (verifyState.error) {
      toast.error(verifyState.error);
    }
  }, [verifyState]);

  // Handle disable 2FA success
  useEffect(() => {
    if (disableState.success) {
      toast.success("2FA disabled successfully");
      // The page will refresh automatically due to revalidatePath
    } else if (disableState.error) {
      toast.error(disableState.error);
    }
  }, [disableState]);

  const isPending = isEnabling || isVerifying || isDisabling;

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

        {/* Enable 2FA Flow */}
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
          <form action={enableAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="enable-password">Password</Label>
              <Input
                id="enable-password"
                name="password"
                type="password"
                placeholder="Enter your account password"
                disabled={isPending}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Required to verify your identity before enabling 2FA
              </p>
              {"password" in enableState.fieldErrors &&
                enableState.fieldErrors.password?.[0] && (
                  <p className="text-sm text-red-600">
                    {enableState.fieldErrors.password[0]}
                  </p>
                )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending} className="flex-1">
                {isEnabling ? "Enabling..." : "Enable 2FA"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEnableFlow(false)}
                className="flex-1"
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* QR Code and Verification */}
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

            <form action={verifyAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verify-code">Verification Code</Label>
                <Input
                  id="verify-code"
                  name="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  disabled={isPending}
                  required
                />
                {"code" in verifyState.fieldErrors &&
                  verifyState.fieldErrors.code?.[0] && (
                    <p className="text-sm text-red-600">
                      {verifyState.fieldErrors.code[0]}
                    </p>
                  )}
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isVerifying ? "Verifying..." : "Verify & Complete Setup"}
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

        {/* Disable 2FA */}
        {user.twoFactorEnabled && (
          <form action={disableAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disable-password">Password</Label>
              <Input
                id="disable-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                disabled={isPending}
                required
              />
              {"password" in disableState.fieldErrors &&
                disableState.fieldErrors.password?.[0] && (
                  <p className="text-sm text-red-600">
                    {disableState.fieldErrors.password[0]}
                  </p>
                )}
            </div>
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
              className="w-full"
            >
              {isDisabling ? "Disabling..." : "Disable 2FA"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
