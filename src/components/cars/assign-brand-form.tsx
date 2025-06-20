"use client";

import { useActionState } from "react";
import { assignBrandAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FORM_INITIAL_STATE } from "@/lib/constants";

interface Brand {
  id: string;
  name: string;
}

interface AssignBrandFormProps {
  unassignedBrands: Brand[];
}

export function AssignBrandForm({ unassignedBrands }: AssignBrandFormProps) {
  const [state, formAction] = useActionState(
    assignBrandAction,
    FORM_INITIAL_STATE
  );

  if (unassignedBrands.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏷️ Assign Brands to Organization</CardTitle>
        <CardDescription>
          Assign existing brands to your organization to use them for adding
          cars
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="brandId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Brand
            </label>
            <select
              id="brandId"
              name="brandId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a brand...</option>
              {unassignedBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            {state.fieldErrors &&
              "brandId" in state.fieldErrors &&
              state.fieldErrors.brandId?.[0] && (
                <p className="text-red-600 text-sm mt-1">
                  {state.fieldErrors.brandId[0]}
                </p>
              )}
          </div>

          {state.error && (
            <div className="text-red-600 text-sm">{state.error}</div>
          )}

          <Button type="submit" disabled={state.success}>
            {state.success ? "Brand Assigned!" : "Assign Brand"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
