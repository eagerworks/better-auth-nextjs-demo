import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Car data access functions
export async function getCars(organizationId?: string | null) {
  return await prisma.car.findMany({
    where: {
      organizationId: organizationId || null,
    },
    include: {
      model: {
        include: {
          brand: true,
        },
      },
      organization: true,
    },
    orderBy: [
      { model: { brand: { name: "asc" } } },
      { model: { name: "asc" } },
      { year: "desc" },
    ],
  });
}

export async function getBrands() {
  return await prisma.brand.findMany({
    include: {
      models: {
        include: {
          _count: {
            select: { cars: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

// Get brands for form dropdowns (simplified)
export async function getBrandsForForm(organizationId?: string | null) {
  return await prisma.brand.findMany({
    where: {
      organizationId: organizationId || null,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

// Get models for a specific brand
export async function getModelsByBrand(brandId: string) {
  return await prisma.model.findMany({
    where: { brandId },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

// Create a new car
export async function createCar(data: {
  modelId: string;
  year: number;
  price: number;
  color: string;
  mileage: number;
}) {
  return await prisma.car.create({
    data: {
      modelId: data.modelId,
      year: data.year,
      price: data.price,
      color: data.color,
      mileage: data.mileage,
    },
    include: {
      model: {
        include: {
          brand: true,
        },
      },
    },
  });
}

// Update a car (only price and mileage)
export async function updateCar(data: {
  id: string;
  price: number;
  mileage: number;
}) {
  return await prisma.car.update({
    where: { id: data.id },
    data: {
      price: data.price,
      mileage: data.mileage,
    },
    include: {
      model: {
        include: {
          brand: true,
        },
      },
    },
  });
}

// Get a single car by ID
export async function getCarById(id: string) {
  return await prisma.car.findUnique({
    where: { id },
    include: {
      model: {
        include: {
          brand: true,
        },
      },
    },
  });
}

// Create a new brand
export async function createBrand(data: { name: string }) {
  return await prisma.brand.create({
    data: {
      name: data.name,
    },
  });
}

// Delete a car
export async function deleteCar(id: string) {
  return await prisma.car.delete({
    where: { id },
  });
}

// Create a new model
export async function createModel(data: { name: string; brandId: string }) {
  return await prisma.model.create({
    data: {
      name: data.name,
      brandId: data.brandId,
    },
    include: {
      brand: true,
    },
  });
}

// Organization data access functions
export async function getUserOrganizations(userId: string) {
  return await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          invitations: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Get user's active organization from session
export async function getUserActiveOrganization(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    select: { activeOrganizationId: true },
  });

  if (!session?.activeOrganizationId) {
    return null;
  }

  return await prisma.organization.findUnique({
    where: { id: session.activeOrganizationId },
  });
}

// Get organization-scoped cars and brands for dashboard
export async function getDashboardData(
  userId: string,
  activeOrganizationId?: string | null
) {
  const organizationId = activeOrganizationId || null;

  const [cars, brands, organizations, unassignedBrands] = await Promise.all([
    // Get cars for current organization context
    prisma.car.findMany({
      where: {
        organizationId: organizationId,
      },
      include: {
        model: {
          include: {
            brand: true,
          },
        },
        organization: true,
      },
      orderBy: [
        { model: { brand: { name: "asc" } } },
        { model: { name: "asc" } },
        { year: "desc" },
      ],
    }),
    // Get brands for current organization context
    prisma.brand.findMany({
      where: {
        organizationId: organizationId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
    // Get user's organizations
    getUserOrganizations(userId),
    // Get unassigned brands (only if user has an active organization)
    activeOrganizationId ? getUnassignedBrands() : Promise.resolve([]),
  ]);

  return { cars, brands, organizations, unassignedBrands };
}

// Get active organization by ID
export async function getActiveOrganization(organizationId: string) {
  return await prisma.organization.findUnique({
    where: { id: organizationId },
  });
}

// Get brands not assigned to any organization (available for assignment)
export async function getUnassignedBrands() {
  return await prisma.brand.findMany({
    where: {
      organizationId: null,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

// Assign a brand to an organization
export async function assignBrandToOrganization(
  brandId: string,
  organizationId: string
) {
  return await prisma.brand.update({
    where: { id: brandId },
    data: { organizationId: organizationId },
  });
}
