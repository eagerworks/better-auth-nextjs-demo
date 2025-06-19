import { getCars, getCarStats } from "@/lib/data";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { betterFetch } from "@better-fetch/fetch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";
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

  // Server-side data fetching - secure and efficient
  const [cars, stats] = await Promise.all([getCars(), getCarStats()]);

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Cars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalCars}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Average Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                $
                {stats.avgPrice
                  ? Math.round(Number(stats.avgPrice)).toLocaleString()
                  : "0"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Brands Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats.brandStats.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cars Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Car Inventory</CardTitle>
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
                    <th className="text-left py-2">Mileage</th>
                    <th className="text-left py-2">Price</th>
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
                        {car.mileage.toLocaleString()} mi
                      </td>
                      <td className="py-3 font-semibold text-green-600">
                        ${Number(car.price).toLocaleString()}
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
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
