import { z } from "zod";

// Sign in form validation
export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Sign up form validation
export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Set password form validation (for OAuth users)
export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// 2FA form validation
export const enable2FASchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const verify2FASchema = z.object({
  code: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must contain only numbers"),
});

export const disable2FASchema = z.object({
  password: z.string().min(1, "Password is required"),
});

// Car form validation
export const addCarSchema = z.object({
  brandId: z.string().min(1, "Please select a brand"),
  modelId: z.string().min(1, "Please select a model"),
  year: z
    .number()
    .int("Year must be a whole number")
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  price: z
    .number()
    .int("Price must be a whole number")
    .positive("Price must be greater than 0")
    .max(9999999, "Price cannot exceed $9,999,999"),
  color: z
    .string()
    .min(1, "Color is required")
    .max(50, "Color must be less than 50 characters"),
  mileage: z
    .number()
    .int("Mileage must be a whole number")
    .min(0, "Mileage cannot be negative")
    .max(999999, "Mileage cannot exceed 999,999"),
});

// Edit car validation (only price and mileage)
export const editCarSchema = z.object({
  id: z.string().min(1, "Car ID is required"),
  price: z
    .number()
    .int("Price must be a whole number")
    .positive("Price must be greater than 0")
    .max(9999999, "Price cannot exceed $9,999,999"),
  mileage: z
    .number()
    .int("Mileage must be a whole number")
    .min(0, "Mileage cannot be negative")
    .max(999999, "Mileage cannot exceed 999,999"),
});

// Brand and Model creation schemas
export const addBrandSchema = z.object({
  name: z
    .string()
    .min(1, "Brand name is required")
    .max(100, "Brand name must be less than 100 characters"),
});

export const addModelSchema = z.object({
  name: z
    .string()
    .min(1, "Model name is required")
    .max(100, "Model name must be less than 100 characters"),
  brandId: z.string().min(1, "Please select a brand"),
});

// Organization validation schemas
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Organization name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug must be less than 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
});

export const inviteMemberSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["member", "admin", "owner"], {
    errorMap: () => ({ message: "Role must be member, admin, or owner" }),
  }),
});

export const assignBrandSchema = z.object({
  brandId: z.string().min(1, "Brand ID is required"),
});

// Type inference for forms
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SetPasswordFormData = z.infer<typeof setPasswordSchema>;
export type Enable2FAFormData = z.infer<typeof enable2FASchema>;
export type Verify2FAFormData = z.infer<typeof verify2FASchema>;
export type Disable2FAFormData = z.infer<typeof disable2FASchema>;
export type AddCarFormData = z.infer<typeof addCarSchema>;
export type EditCarFormData = z.infer<typeof editCarSchema>;
export type AddBrandFormData = z.infer<typeof addBrandSchema>;
export type AddModelFormData = z.infer<typeof addModelSchema>;
export type CreateOrganizationFormData = z.infer<
  typeof createOrganizationSchema
>;
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
export type AssignBrandFormData = z.infer<typeof assignBrandSchema>;
