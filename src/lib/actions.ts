"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addCarSchema,
  addBrandSchema,
  addModelSchema,
  editCarSchema,
  setPasswordSchema,
  createOrganizationSchema,
  inviteMemberSchema,
  assignBrandSchema,
} from "@/lib/validations";
import {
  createCar,
  createBrand,
  createModel,
  getModelsByBrand,
  updateCar,
  deleteCar,
  assignBrandToOrganization,
} from "@/lib/data";
import { auth } from "@/lib/auth";

async function validateSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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
    const session = await validateSession();

    const rawData = parseAddCarFormData(formData);

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

    // Create the car with organization context for multi-tenant data isolation
    const car = await createCar({
      ...validationResult.data,
      organizationId: session.session.activeOrganizationId,
    });

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
    await validateSession();

    const rawData = parseEditCarFormData(formData);

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
    const session = await validateSession();

    const name = formData.get("name");
    if (!name) {
      return {
        success: false,
        error: "Brand name is required",
        fieldErrors: { name: "Brand name is required" },
      };
    }

    const rawData = { name: name.toString() };

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

    // Create the brand with organization context for multi-tenant data isolation
    const brand = await createBrand({
      ...validationResult.data,
      organizationId: session.session.activeOrganizationId,
    });

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
    await validateSession();

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

// Add this new action for OAuth users to set their initial password
export async function setPasswordAction(prevState: any, formData: FormData) {
  try {
    // Validate form data using Zod
    const validatedFields = setPasswordSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Invalid form data",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { password } = validatedFields.data;

    const result = await auth.api.setPassword({
      body: { newPassword: password },
      headers: await headers(),
    });

    if (!result.status) {
      return {
        success: false,
        error: "Failed to set password",
        fieldErrors: {},
      };
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Password set successfully!",
      fieldErrors: {},
    };
  } catch (error: any) {
    console.error("Set password error:", error);
    return {
      success: false,
      error: error.message || "Failed to set password",
      fieldErrors: {},
    };
  }
}

// Note: 2FA actions removed - now handled client-side using Better Auth client methods
// See components/auth/two-factor-settings.tsx for the new implementation

// Organization Actions
export async function createOrganizationAction(
  prevState: any,
  formData: FormData
) {
  try {
    // Validate form data using Zod
    const validatedFields = createOrganizationSchema.safeParse({
      name: formData.get("name"),
      slug:
        formData.get("slug") ||
        (formData.get("name") as string)
          ?.trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Invalid form data",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { name, slug } = validatedFields.data;

    const result = await auth.api.createOrganization({
      body: { name, slug },
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to create organization",
        fieldErrors: {},
      };
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      fieldErrors: {},
    };
  } catch (error: any) {
    console.error("Create Organization error:", error);
    return {
      success: false,
      error: error.message || "Failed to create organization",
      fieldErrors: {},
    };
  }
}

export async function inviteMemberAction(prevState: any, formData: FormData) {
  try {
    // Validate form data using Zod
    const validatedFields = inviteMemberSchema.safeParse({
      organizationId: formData.get("organizationId"),
      email: formData.get("email"),
      role: formData.get("role") || "member",
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Invalid form data",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { organizationId, email, role } = validatedFields.data;

    const result = await auth.api.createInvitation({
      body: { organizationId, email, role },
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to send invitation",
        fieldErrors: {},
      };
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      fieldErrors: {},
    };
  } catch (error: any) {
    console.error("Invite Member error:", error);
    return {
      success: false,
      error: error.message || "Failed to send invitation",
      fieldErrors: {},
    };
  }
}

export async function switchOrganizationAction(
  prevState: any,
  formData: FormData
) {
  try {
    const organizationId = formData.get("organizationId") as string;

    if (!organizationId) {
      return {
        success: false,
        error: "Organization ID is required",
        fieldErrors: {},
      };
    }

    const result = await auth.api.setActiveOrganization({
      body: { organizationId },
      headers: await headers(),
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to switch organization",
        fieldErrors: {},
      };
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      fieldErrors: {},
    };
  } catch (error: any) {
    console.error("Switch Organization error:", error);
    return {
      success: false,
      error: error.message || "Failed to switch organization",
      fieldErrors: {},
    };
  }
}

// Assign existing brand to current organization
export async function assignBrandAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await validateSession();

    // Get active organization
    const activeOrganizationId = session.session.activeOrganizationId;
    if (!activeOrganizationId) {
      return {
        success: false,
        error: "No active organization selected",
        fieldErrors: {},
      };
    }

    const brandId = formData.get("brandId");
    if (!brandId) {
      return {
        success: false,
        error: "Brand ID is required",
        fieldErrors: { brandId: "Please select a brand" },
      };
    }

    const rawData = { brandId: brandId.toString() };

    const validationResult = assignBrandSchema.safeParse(rawData);

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

    // Assign the brand to the organization
    const brand = await assignBrandToOrganization(
      validationResult.data.brandId,
      activeOrganizationId
    );

    revalidatePath("/dashboard");

    return {
      success: true,
      data: brand,
    };
  } catch (error) {
    console.error("Error assigning brand:", error);

    return {
      success: false,
      error: "Failed to assign brand. Please try again.",
    };
  }
}
