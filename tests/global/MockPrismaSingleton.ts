import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Prisma Mocking is accomplished following Prisma's instructions
// https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing#example-unit-tests

import truckbasePrismaClient from '../../src/global/PrismaClient';

jest.mock('../../src/global/PrismaClient', () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
    mockReset(prismaMock)
})

export const prismaMock = truckbasePrismaClient as unknown as DeepMockProxy<PrismaClient>