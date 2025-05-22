const { serve } = require('@hono/node-server')
const { Hono } = require('hono')
const { cors } = require('hono/cors')
const Database = require('better-sqlite3')

// Initialize database
const db = new Database('database.sqlite')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

const app = new Hono()

// Enable CORS
app.use('/*', cors())

// Routes
app.get('/', (c) => {
  return c.json({ message: 'Welcome to the API' })
})

// Items routes
app.get('/api/items', (c) => {
  const items = db.prepare('SELECT * FROM items').all()
  return c.json(items)
})

app.post('/api/items', async (c) => {
  const { name, description } = await c.req.json()
  const result = db.prepare('INSERT INTO items (name, description) VALUES (?, ?)')
    .run(name, description)
  return c.json({ id: result.lastInsertRowid, name, description })
})

// Start server
serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on port ${info.port}`)
}) 