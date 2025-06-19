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

export async function getCarStats() {
  const [totalCars, avgPrice, brandStats] = await Promise.all([
    prisma.car.count(),
    prisma.car.aggregate({
      _avg: { price: true },
    }),
    prisma.brand.findMany({
      include: {
        _count: {
          select: {
            models: {
              where: {
                cars: {
                  some: {},
                },
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    totalCars,
    avgPrice: avgPrice._avg.price,
    brandStats,
  };
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
