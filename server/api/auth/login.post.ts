import { defineEventHandler, readBody, createError, setCookie } from 'h3'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = loginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials',
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials',
      })
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
    const token = jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn }
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