"use client";

import { useEffect, useActionState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { editCarAction } from "@/lib/actions";
import { Edit2 } from "lucide-react";
import type { Car } from "@/lib/types";
import { FORM_INITIAL_STATE } from "@/lib/constants";

interface EditCarDialogProps {
  car: Car;
  onSuccess?: () => void;
}

export function EditCarDialog({ car, onSuccess }: EditCarDialogProps) {
  const [state, formAction, isPending] = useActionState(
    editCarAction,
    FORM_INITIAL_STATE
  );

  // Handle success/error states
  useEffect(() => {
    if (state.success) {
      toast.success("Car updated successfully!");
      onSuccess?.();
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Car</DialogTitle>
          <DialogDescription>
            Update the price and mileage for this {car.model.brand.name}{" "}
            {car.model.name} ({car.year})
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {/* Hidden car ID */}
          <input type="hidden" name="id" value={car.id} />

          {/* Car Details (Read-only) */}
          <div className="grid grid-cols-3 gap-4 py-2 text-sm bg-gray-50 rounded-lg p-3">
            <div>
              <span className="font-medium text-gray-600">Brand:</span>
              <div className="font-semibold">{car.model.brand.name}</div>
            </div>
            <div>
              <span className="font-medium text-gray-600">Model:</span>
              <div className="font-semibold">{car.model.name}</div>
            </div>
            <div>
              <span className="font-medium text-gray-600">Year:</span>
              <div className="font-semibold">{car.year}</div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 mb-4">
            <div className="flex items-center justify-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full border"
                style={{ backgroundColor: car.color.toLowerCase() }}
              ></span>
              <span className="font-medium">{car.color}</span>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                type="number"
                id="price"
                name="price"
                min="0"
                defaultValue={car.price}
                placeholder="25000"
                required
              />
              {state.fieldErrors?.price && (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.price}
                </p>
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
                defaultValue={Math.round(car.mileage)}
                placeholder="24000"
                required
              />
              {state.fieldErrors?.mileage && (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.mileage}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update Car"}
            </Button>
          </DialogFooter>

          {/* General Error */}
          {state.error &&
            state.fieldErrors &&
            Object.keys(state.fieldErrors).length === 0 && (
              <p className="text-sm text-red-600 text-center">{state.error}</p>
            )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
