import { beforeEach } from "vitest"
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended"
import { PrismaClient } from "@prisma/client"

export const prisma = mockDeep<PrismaClient>()

beforeEach(() => {
    mockReset(prisma)
})

export type MockPrismaClient = DeepMockProxy<PrismaClient>