import { getDashboardData, getActiveOrganization } from "@/lib/data";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { betterFetch } from "@better-fetch/fetch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AddCarForm } from "@/components/cars/add-car-form";
import { EditCarDialog } from "@/components/cars/edit-car-dialog";
import { DeleteCarDialog } from "@/components/cars/delete-car-dialog";
import { AssignBrandForm } from "@/components/cars/assign-brand-form";
import { TwoFactorSettings } from "@/components/auth/two-factor-settings";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { OrganizationSettings } from "@/components/auth/organization-settings";

import type { Session } from "@/lib/auth";

export default async function DashboardPage() {
  // Server-side session validation - no tokens exposed to client
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      headers: await headers(),
    }
  );

  if (!session) {
    redirect("/sign-in");
  }

  // Get user's active organization from session
  const activeOrganization = session.session.activeOrganizationId
    ? await getActiveOrganization(session.session.activeOrganizationId)
    : null;

  // Get all dashboard data with organization context
  const { cars, brands, organizations, unassignedBrands } =
    await getDashboardData(session.user.id, activeOrganization?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session.user.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your car collection and account settings
            </p>
            {activeOrganization && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                🏢{" "}
                <span className="font-medium">{activeOrganization.name}</span>
                <span className="text-blue-600">Organization</span>
              </div>
            )}
            {!activeOrganization && organizations.length > 0 && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                👤 <span className="font-medium">Personal</span>
                <span className="text-gray-600">No organization selected</span>
              </div>
            )}
          </div>
          <SignOutButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile & Security Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👤 Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{session.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{session.user.email}</p>
                </div>
                {session.user.image && (
                  <div>
                    <p className="text-sm text-gray-600">Avatar</p>
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Setting for OAuth Users */}
            {session.user.image && <SetPasswordForm />}

            {/* 2FA Security */}
            <TwoFactorSettings user={session.user} />

            {/* Organization Management */}
            <OrganizationSettings organizations={organizations} />
          </div>

          {/* Car Management Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assign Brands (only show if there are unassigned brands and active org) */}
            {activeOrganization && unassignedBrands.length > 0 && (
              <AssignBrandForm unassignedBrands={unassignedBrands} />
            )}

            {/* Add New Car - only show if there are brands assigned */}
            {brands.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>🚗 Add New Car</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddCarForm brands={brands} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>🚗 Add New Car</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      No brands available for your organization yet.
                    </p>
                    <p className="text-sm text-gray-400">
                      {activeOrganization
                        ? "Assign brands to your organization first to start adding cars."
                        : "Select an organization to manage cars and brands."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Car Collection */}
            <Card>
              <CardHeader>
                <CardTitle>Your Car Collection ({cars.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {cars.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      No cars in your collection yet.
                    </p>
                    <p className="text-sm text-gray-400">
                      Add your first car using the form above!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cars.map((car: any) => (
                      <div
                        key={car.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {car.model.brand.name} {car.model.name}
                            </h3>
                            <p className="text-gray-600">{car.year}</p>
                          </div>
                          <div className="flex gap-2">
                            <EditCarDialog car={car} />
                            <DeleteCarDialog car={car} />
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-600">Price:</span>{" "}
                            <span className="font-medium">
                              ${car.price.toLocaleString()}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Color:</span>{" "}
                            <span className="font-medium">{car.color}</span>
                          </p>
                          <p>
                            <span className="text-gray-600">Mileage:</span>{" "}
                            <span className="font-medium">
                              {car.mileage.toLocaleString()} miles
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">
              🔒 Server-Side Security Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <p className="mb-2">
              This dashboard demonstrates Better Auth's server-first approach:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <strong>Session validation</strong> happens server-side - no
                tokens exposed to client
              </li>
              <li>
                <strong>Data fetching</strong> occurs on the server - direct
                database access without API calls
              </li>
              <li>
                <strong>Authentication state</strong> is resolved before page
                renders - no loading states needed
              </li>
              <li>
                <strong>Sensitive data</strong> never leaves the server
                environment
              </li>
              <li>
                <strong>Server Actions</strong> provide secure, type-safe
                mutations with built-in CSRF protection
              </li>
              <li>
                <strong>Two-Factor Authentication</strong> enterprise-grade
                security with TOTP codes and backup codes
              </li>
              <li>
                <strong>Multi-tenant Organizations</strong> secure role-based
                access control with member invitations and permissions
              </li>
              <li>
                <strong>Organization Data Isolation</strong> server-side
                filtering ensures users only see their organization data
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
