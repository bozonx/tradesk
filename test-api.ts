import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
}

// JWT secret (should match your server's secret)
const JWT_SECRET = 'your-secret-key'

async function getAuthToken() {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: TEST_USER.email }
  })

  if (!user) {
    throw new Error('Test user not found. Please run prisma:seed first.')
  }

  // Verify password
  const isValid = await bcryptjs.compare(TEST_USER.password, user.password)
  if (!isValid) {
    throw new Error('Invalid password')
  }

  // Generate token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1d' }
  )

  return token
}

async function testApi() {
  try {
    // Get auth token
    const token = await getAuthToken()
    console.log('Auth token:', token)

    // Test GET /api/wallets
    console.log('\nTesting GET /api/wallets:')
    const walletsResponse = await fetch('http://localhost:3000/api/wallets', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const wallets = await walletsResponse.json()
    console.log('Wallets:', JSON.stringify(wallets, null, 2))

    // Test POST /api/wallets
    console.log('\nTesting POST /api/wallets:')
    const newWallet = {
      name: 'Test Wallet',
      descr: 'Test wallet description',
      state: 'active'
    }
    const createResponse = await fetch('http://localhost:3000/api/wallets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newWallet)
    })
    const createdWallet = await createResponse.json()
    console.log('Created wallet:', JSON.stringify(createdWallet, null, 2))

    // Test GET /api/wallets/[id]
    if (createdWallet.data?.id) {
      console.log('\nTesting GET /api/wallets/[id]:')
      const getResponse = await fetch(`http://localhost:3000/api/wallets/${createdWallet.data.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const wallet = await getResponse.json()
      console.log('Wallet details:', JSON.stringify(wallet, null, 2))

      // Test PUT /api/wallets/[id]
      console.log('\nTesting PUT /api/wallets/[id]:')
      const updateData = {
        name: 'Updated Test Wallet',
        descr: 'Updated test wallet description'
      }
      const updateResponse = await fetch(`http://localhost:3000/api/wallets/${createdWallet.data.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      const updatedWallet = await updateResponse.json()
      console.log('Updated wallet:', JSON.stringify(updatedWallet, null, 2))

      // Test DELETE /api/wallets/[id]
      console.log('\nTesting DELETE /api/wallets/[id]:')
      const deleteResponse = await fetch(`http://localhost:3000/api/wallets/${createdWallet.data.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const deleteResult = await deleteResponse.json()
      console.log('Delete result:', JSON.stringify(deleteResult, null, 2))
    }

  } catch (error) {
    console.error('Error testing API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testApi() 