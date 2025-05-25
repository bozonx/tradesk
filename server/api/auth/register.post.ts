import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, name, role } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'Email already registered',
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Invalid input',
        data: error.errors,
      })
    }

    throw error
  }
}) 