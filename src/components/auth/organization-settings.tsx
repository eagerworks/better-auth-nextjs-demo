"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { organization } from "@/lib/auth-client";
import type { UserOrganization } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OrganizationSettingsProps {
  organizations: UserOrganization[];
}

export function OrganizationSettings({
  organizations,
}: OrganizationSettingsProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState<string | null>(null);

  const { create, setActive, inviteMember } = organization;

  const handleCreateOrganization = async (formData: FormData) => {
    setIsCreating(true);

    try {
      const name = formData.get("name") as string;
      const slug =
        (formData.get("slug") as string) ||
        name
          ?.trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

      await create({
        name,
        slug,
      });

      toast.success("Organization created successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create organization");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSwitchOrganization = async (organizationId: string) => {
    setIsSwitching(organizationId);

    try {
      await setActive({
        organizationId,
      });

      toast.success("Organization switched successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to switch organization");
    } finally {
      setIsSwitching(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏢 Organizations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Create New Organization</h3>
          <form action={handleCreateOrganization} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                name="name"
                placeholder="My Company"
                required
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug (optional)</Label>
              <Input
                id="org-slug"
                name="slug"
                placeholder="my-company"
                disabled={isCreating}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        </div>

        {organizations.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Your Organizations</h3>
            <div className="space-y-3">
              {organizations.map((org) => (
                <div key={org.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{org.name}</h4>
                      <p className="text-sm text-gray-600">Slug: {org.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSwitchOrganization(org.id)}
                        disabled={isSwitching === org.id}
                      >
                        {isSwitching === org.id ? "Switching..." : "Switch"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setShowInviteForm(
                            showInviteForm === org.id ? null : org.id
                          )
                        }
                      >
                        Invite
                      </Button>
                    </div>
                  </div>

                  {showInviteForm === org.id && (
                    <InviteForm
                      organizationId={org.id}
                      onCancel={() => setShowInviteForm(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InviteForm({
  organizationId,
  onCancel,
}: {
  organizationId: string;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [isInviting, setIsInviting] = useState(false);
  const { inviteMember } = organization;

  const handleInviteMember = async (formData: FormData) => {
    setIsInviting(true);

    try {
      const email = formData.get("email") as string;
      const role = formData.get("role") as "member" | "admin";

      await inviteMember({
        email,
        role,
        organizationId,
      });

      toast.success("Invitation sent successfully!");
      router.refresh();
      // Close form after successful invite
      setTimeout(() => {
        onCancel();
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="mt-3 p-3 border-t">
      <h5 className="font-medium mb-2">Invite Member</h5>
      <form action={handleInviteMember} className="space-y-2">
        <div className="space-y-2">
          <Label htmlFor={`email-${organizationId}`}>Email</Label>
          <Input
            id={`email-${organizationId}`}
            name="email"
            type="email"
            placeholder="member@example.com"
            required
            disabled={isInviting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`role-${organizationId}`}>Role</Label>
          <select
            id={`role-${organizationId}`}
            name="role"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isInviting}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isInviting}>
            {isInviting ? "Sending..." : "Send Invite"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
