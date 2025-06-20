"use client";

import { useEffect, useState, useActionState, startTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addCarAction, getModelsAction } from "@/lib/actions";
import type { BrandForForm, ModelForForm } from "@/lib/types";
import { FORM_INITIAL_STATE } from "@/lib/constants";

interface AddCarFormProps {
  brands: BrandForForm[];
  onSuccess?: () => void;
}

export function AddCarForm({ brands, onSuccess }: AddCarFormProps) {
  const [state, formAction, isPending] = useActionState(
    addCarAction,
    FORM_INITIAL_STATE
  );

  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [models, setModels] = useState<ModelForForm[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Load models when brand changes
  useEffect(() => {
    const loadModels = async () => {
      if (selectedBrandId) {
        setLoadingModels(true);

        try {
          const brandModels = await getModelsAction(selectedBrandId);
          setModels(brandModels);
        } catch (error) {
          console.error("Error loading models:", error);
          toast.error("Failed to load models");
        } finally {
          setLoadingModels(false);
        }
      } else {
        setModels([]);
      }
    };

    loadModels();
  }, [selectedBrandId]);

  // Handle success/error states
  useEffect(() => {
    if (state.success) {
      toast.success("Car added successfully!");
      onSuccess?.();
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Car</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {/* Brand Selection */}
          <div className="space-y-2">
            <Label htmlFor="brandId">Brand</Label>
            <select
              id="brandId"
              name="brandId"
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            {state.fieldErrors?.brandId && (
              <p className="text-sm text-red-600">
                {state.fieldErrors.brandId}
              </p>
            )}
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="modelId">Model</Label>
            <select
              id="modelId"
              name="modelId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedBrandId || loadingModels}
              required
            >
              <option value="">
                {loadingModels
                  ? "Loading models..."
                  : selectedBrandId
                  ? "Select a model"
                  : "Select a brand first"}
              </option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            {state.fieldErrors?.modelId && (
              <p className="text-sm text-red-600">
                {state.fieldErrors.modelId}
              </p>
            )}
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              type="number"
              id="year"
              name="year"
              min="1900"
              max={new Date().getFullYear() + 1}
              placeholder="2024"
              required
            />
            {state.fieldErrors?.year && (
              <p className="text-sm text-red-600">{state.fieldErrors.year}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              type="number"
              id="price"
              name="price"
              min="0"
              placeholder="25000"
              required
            />
            {state.fieldErrors?.price && (
              <p className="text-sm text-red-600">{state.fieldErrors.price}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              type="text"
              id="color"
              name="color"
              placeholder="Red"
              maxLength={50}
              required
            />
            {state.fieldErrors?.color && (
              <p className="text-sm text-red-600">{state.fieldErrors.color}</p>
            )}
          </div>

          {/* Kilometers */}
          <div className="space-y-2">
            <Label htmlFor="mileage">Kilometers</Label>
            <Input
              type="number"
              id="mileage"
              name="mileage"
              min="0"
              max="9999999"
              placeholder="24000"
              required
            />
            {state.fieldErrors?.mileage && (
              <p className="text-sm text-red-600">
                {state.fieldErrors.mileage}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending || !selectedBrandId}
            className="w-full"
          >
            {isPending ? "Adding Car..." : "Add Car"}
          </Button>

          {/* General Error */}
          {state.error &&
            state.fieldErrors &&
            Object.keys(state.fieldErrors).length === 0 && (
              <p className="text-sm text-red-600 text-center">{state.error}</p>
            )}
        </form>
      </CardContent>
    </Card>
  );
}
