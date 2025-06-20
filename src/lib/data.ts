import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Car data access functions
export async function getCars() {
  return await prisma.car.findMany({
    include: {
      model: {
        include: {
          brand: true,
        },
      },
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
export async function getBrandsForForm() {
  return await prisma.brand.findMany({
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
