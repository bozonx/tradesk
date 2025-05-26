import { defineEventHandler, readBody, createError, setCookie } from 'h3'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'

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
        message: 'Email already exists',
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

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const options: SignOptions = {
      expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
    }
    const token = jwt.sign(
      { userId: user.id },
      secret,
      options
    )

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        userAgent: event.node.req.headers['user-agent'],
        ipAddress: event.node.req.socket.remoteAddress,
      },
    })

    // Set auth cookie
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
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