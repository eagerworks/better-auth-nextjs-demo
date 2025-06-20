"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { betterFetch } from "@better-fetch/fetch";
import {
  addCarSchema,
  addBrandSchema,
  addModelSchema,
  editCarSchema,
} from "@/lib/validations";
import {
  createCar,
  createBrand,
  createModel,
  getModelsByBrand,
  updateCar,
  deleteCar,
} from "@/lib/data";
import type { Session } from "@/lib/auth";

// Helper function to validate session
async function validateSession() {
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

  return session;
}

// Server action result type
type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
};

// Helper function to safely parse FormData
function parseAddCarFormData(formData: FormData) {
  const brandId = formData.get("brandId");
  const modelId = formData.get("modelId");
  const year = formData.get("year");
  const price = formData.get("price");
  const color = formData.get("color");
  const mileage = formData.get("mileage");

  // Validate all required fields exist
  if (!brandId || !modelId || !year || !price || !color || !mileage) {
    throw new Error("Missing required form fields");
  }

  // Parse with error handling
  const parsedYear = parseInt(year.toString());
  const parsedPrice = parseFloat(price.toString());
  const parsedMileage = parseInt(mileage.toString());

  // Check for parsing errors
  if (isNaN(parsedYear) || isNaN(parsedPrice) || isNaN(parsedMileage)) {
    throw new Error("Invalid numeric values");
  }

  return {
    brandId: brandId.toString(),
    modelId: modelId.toString(),
    year: parsedYear,
    price: parsedPrice,
    color: color.toString(),
    mileage: parsedMileage,
  };
}

// Helper function to parse edit car form data
function parseEditCarFormData(formData: FormData) {
  const id = formData.get("id");
  const price = formData.get("price");
  const mileage = formData.get("mileage");

  // Validate all required fields exist
  if (!id || !price || !mileage) {
    throw new Error("Missing required form fields");
  }

  // Parse with error handling
  const parsedPrice = parseFloat(price.toString());
  const parsedMileage = parseInt(mileage.toString());

  // Check for parsing errors
  if (isNaN(parsedPrice) || isNaN(parsedMileage)) {
    throw new Error("Invalid numeric values");
  }

  return {
    id: id.toString(),
    price: parsedPrice,
    mileage: parsedMileage,
  };
}

// Add a new car
export async function addCarAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Validate session
    await validateSession();

    // Parse form data safely
    const rawData = parseAddCarFormData(formData);

    // Validate with Zod
    const validationResult = addCarSchema.safeParse(rawData);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });

      return {
        success: false,
        error: "Validation failed",
        fieldErrors,
      };
    }

    // Create the car
    const car = await createCar(validationResult.data);

    // Revalidate the dashboard page to show the new car
    revalidatePath("/dashboard");

    return {
      success: true,
      data: car,
    };
  } catch (error) {
    console.error("Error adding car:", error);
    return {
      success: false,
      error: "Failed to add car. Please try again.",
    };
  }
}

// Edit an existing car
export async function editCarAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Validate session
    await validateSession();

    // Parse form data safely
    const rawData = parseEditCarFormData(formData);

    // Validate with Zod
    const validationResult = editCarSchema.safeParse(rawData);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });

      return {
        success: false,
        error: "Validation failed",
        fieldErrors,
      };
    }

    // Update the car
    const car = await updateCar(validationResult.data);

    // Revalidate the dashboard page to show the updated car
    revalidatePath("/dashboard");

    return {
      success: true,
      data: car,
    };
  } catch (error) {
    console.error("Error updating car:", error);
    return {
      success: false,
      error: "Failed to update car. Please try again.",
    };
  }
}

// Add a new brand
export async function addBrandAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Validate session
    await validateSession();

    // Parse form data
    const name = formData.get("name");
    if (!name) {
      return {
        success: false,
        error: "Brand name is required",
        fieldErrors: { name: "Brand name is required" },
      };
    }

    const rawData = { name: name.toString() };

    // Validate with Zod
    const validationResult = addBrandSchema.safeParse(rawData);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });

      return {
        success: false,
        error: "Validation failed",
        fieldErrors,
      };
    }

    // Create the brand
    const brand = await createBrand(validationResult.data);

    // Revalidate relevant paths
    revalidatePath("/dashboard");

    return {
      success: true,
      data: brand,
    };
  } catch (error) {
    console.error("Error adding brand:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "A brand with this name already exists.",
        fieldErrors: { name: "This brand name is already taken" },
      };
    }

    return {
      success: false,
      error: "Failed to add brand. Please try again.",
    };
  }
}

// Add a new model
export async function addModelAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Validate session
    await validateSession();

    // Parse form data
    const name = formData.get("name");
    const brandId = formData.get("brandId");

    if (!name || !brandId) {
      return {
        success: false,
        error: "All fields are required",
        fieldErrors: {
          name: !name ? "Model name is required" : "",
          brandId: !brandId ? "Brand selection is required" : "",
        },
      };
    }

    const rawData = {
      name: name.toString(),
      brandId: brandId.toString(),
    };

    // Validate with Zod
    const validationResult = addModelSchema.safeParse(rawData);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });

      return {
        success: false,
        error: "Validation failed",
        fieldErrors,
      };
    }

    // Create the model
    const model = await createModel(validationResult.data);

    // Revalidate relevant paths
    revalidatePath("/dashboard");

    return {
      success: true,
      data: model,
    };
  } catch (error) {
    console.error("Error adding model:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "A model with this name already exists for this brand.",
        fieldErrors: {
          name: "This model name already exists for the selected brand",
        },
      };
    }

    return {
      success: false,
      error: "Failed to add model. Please try again.",
    };
  }
}

// Delete a car
export async function deleteCarAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Validate session
    await validateSession();

    // Get car ID from form data
    const carId = formData.get("carId");

    if (!carId || typeof carId !== "string") {
      return {
        success: false,
        error: "Invalid car ID",
      };
    }

    // Delete the car
    await deleteCar(carId.toString());

    // Revalidate the dashboard page to remove the deleted car
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: "Failed to delete car. Please try again.",
    };
  }
}

// Get models by brand ID (for dynamic form updates)
export async function getModelsAction(brandId: string) {
  try {
    await validateSession();
    return await getModelsByBrand(brandId);
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}
