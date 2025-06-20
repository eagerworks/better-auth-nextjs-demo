"use client";

import { useEffect, useActionState, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCarAction } from "@/lib/actions";
import { Trash2 } from "lucide-react";
import type { Car } from "@/lib/types";
import { FORM_INITIAL_STATE } from "@/lib/constants";

interface DeleteCarDialogProps {
  car: Car;
  onSuccess?: () => void;
}

export function DeleteCarDialog({ car, onSuccess }: DeleteCarDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    deleteCarAction,
    FORM_INITIAL_STATE
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Car deleted successfully!");
      setIsOpen(false);
      onSuccess?.();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Car</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this car? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Brand:</span>
            <span className="font-semibold">{car.model.brand.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Model:</span>
            <span className="font-semibold">{car.model.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Year:</span>
            <span className="font-semibold">{car.year}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Color:</span>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full border"
                style={{ backgroundColor: car.color.toLowerCase() }}
              ></span>
              <span className="font-semibold">{car.color}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Price:</span>
            <span className="font-semibold text-green-600">
              ${car.price.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Mileage:</span>
            <span className="font-semibold">
              {car.mileage.toLocaleString()} km
            </span>
          </div>
        </div>

        <form action={formAction}>
          <input type="hidden" name="carId" value={car.id} />
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Deleting..." : "Delete Car"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
