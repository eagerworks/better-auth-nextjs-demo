import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create brands
  const toyota = await prisma.brand.upsert({
    where: { name: "Toyota" },
    update: {},
    create: { name: "Toyota" },
  });

  const bmw = await prisma.brand.upsert({
    where: { name: "BMW" },
    update: {},
    create: { name: "BMW" },
  });

  const tesla = await prisma.brand.upsert({
    where: { name: "Tesla" },
    update: {},
    create: { name: "Tesla" },
  });

  const ford = await prisma.brand.upsert({
    where: { name: "Ford" },
    update: {},
    create: { name: "Ford" },
  });

  const honda = await prisma.brand.upsert({
    where: { name: "Honda" },
    update: {},
    create: { name: "Honda" },
  });

  // Create models
  const camry = await prisma.model.upsert({
    where: { brandId_name: { brandId: toyota.id, name: "Camry" } },
    update: {},
    create: { name: "Camry", brandId: toyota.id },
  });

  const prius = await prisma.model.upsert({
    where: { brandId_name: { brandId: toyota.id, name: "Prius" } },
    update: {},
    create: { name: "Prius", brandId: toyota.id },
  });

  const x3 = await prisma.model.upsert({
    where: { brandId_name: { brandId: bmw.id, name: "X3" } },
    update: {},
    create: { name: "X3", brandId: bmw.id },
  });

  const series3 = await prisma.model.upsert({
    where: { brandId_name: { brandId: bmw.id, name: "3 Series" } },
    update: {},
    create: { name: "3 Series", brandId: bmw.id },
  });

  const model3 = await prisma.model.upsert({
    where: { brandId_name: { brandId: tesla.id, name: "Model 3" } },
    update: {},
    create: { name: "Model 3", brandId: tesla.id },
  });

  const f150 = await prisma.model.upsert({
    where: { brandId_name: { brandId: ford.id, name: "F-150" } },
    update: {},
    create: { name: "F-150", brandId: ford.id },
  });

  const civic = await prisma.model.upsert({
    where: { brandId_name: { brandId: honda.id, name: "Civic" } },
    update: {},
    create: { name: "Civic", brandId: honda.id },
  });

  // Create cars
  const cars = [
    { year: 2024, price: 28500, color: "White", mileage: 0, modelId: camry.id },
    {
      year: 2023,
      price: 25500,
      color: "Silver",
      mileage: 15000,
      modelId: camry.id,
    },
    { year: 2024, price: 32000, color: "Blue", mileage: 0, modelId: prius.id },
    { year: 2024, price: 52000, color: "Black", mileage: 8000, modelId: x3.id },
    {
      year: 2023,
      price: 45000,
      color: "White",
      mileage: 12000,
      modelId: series3.id,
    },
    { year: 2024, price: 45000, color: "Red", mileage: 0, modelId: model3.id },
    {
      year: 2023,
      price: 38000,
      color: "Gray",
      mileage: 25000,
      modelId: model3.id,
    },
    { year: 2024, price: 48000, color: "Blue", mileage: 0, modelId: f150.id },
    {
      year: 2023,
      price: 44000,
      color: "White",
      mileage: 12000,
      modelId: f150.id,
    },
    {
      year: 2024,
      price: 24000,
      color: "Silver",
      mileage: 0,
      modelId: civic.id,
    },
  ];

  for (const carData of cars) {
    await prisma.car.create({
      data: carData,
    });
  }

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
