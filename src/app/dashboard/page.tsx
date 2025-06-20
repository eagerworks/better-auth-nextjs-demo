import { getCars, getBrandsForForm } from "@/lib/data";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { betterFetch } from "@better-fetch/fetch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AddCarForm } from "@/components/cars/add-car-form";
import { EditCarDialog } from "@/components/cars/edit-car-dialog";
import { DeleteCarDialog } from "@/components/cars/delete-car-dialog";
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

  const [cars, brands] = await Promise.all([getCars(), getBrandsForForm()]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Car Inventory Dashboard</h1>
          <SignOutButton />
        </div>

        {/* User Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome back, {session.user.name}!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Email:</span> {session.user.email}
              </div>
              <div>
                <span className="font-medium">User ID:</span> {session.user.id}
              </div>
              <div>
                <span className="font-medium">Session expires:</span>{" "}
                {new Date(session.session.expiresAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Car Form */}
        <div className="mb-6">
          <AddCarForm brands={brands} />
        </div>

        {/* Cars Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Car Inventory ({cars.length} cars)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Brand</th>
                    <th className="text-left py-2">Model</th>
                    <th className="text-left py-2">Year</th>
                    <th className="text-left py-2">Color</th>
                    <th className="text-left py-2">Kilometers</th>
                    <th className="text-left py-2">Price</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">
                        {car.model.brand.name}
                      </td>
                      <td className="py-3">{car.model.name}</td>
                      <td className="py-3">{car.year}</td>
                      <td className="py-3">
                        <span
                          className="inline-block w-4 h-4 rounded-full mr-2 border"
                          style={{ backgroundColor: car.color.toLowerCase() }}
                        ></span>
                        {car.color}
                      </td>
                      <td className="py-3">
                        {car.mileage.toLocaleString()} km
                      </td>
                      <td className="py-3 font-semibold text-green-600">
                        ${car.price.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <EditCarDialog car={car} />
                          <DeleteCarDialog car={car} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Server-side Security Note */}
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
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
