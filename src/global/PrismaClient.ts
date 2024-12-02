import {PrismaClient} from "@prisma/client";

// Singleton Prisma Client
const truckbasePrismaClient = new PrismaClient()
export default truckbasePrismaClient