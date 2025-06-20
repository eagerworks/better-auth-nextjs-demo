"use client";

import { useEffect, useActionState } from "react";
import { toast } from "sonner";
import { setPasswordAction } from "@/lib/actions";
import { FORM_INITIAL_STATE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    setPasswordAction,
    FORM_INITIAL_STATE
  );

  // Handle success/error states
  useEffect(() => {
    if (state.success) {
      toast.success("Password set successfully! You can now enable 2FA.");
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔑 Set Account Password
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm text-blue-800">
            Since you signed up with GitHub, you need to set a password before
            enabling 2FA.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter new password (8+ characters)"
              disabled={isPending}
              required
            />
            {"password" in state.fieldErrors &&
              state.fieldErrors.password?.[0] && (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.password[0]}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              disabled={isPending}
              required
            />
            {"confirmPassword" in state.fieldErrors &&
              state.fieldErrors.confirmPassword?.[0] && (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.confirmPassword[0]}
                </p>
              )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Setting Password..." : "Set Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
