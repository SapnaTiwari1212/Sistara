/**
 * SISTARA API — entry point.
 *   npm run dev   -> node --watch server.js
 *   npm start     -> node server.js
 */

import 'dotenv/config'
import { connectDB, disconnectDB } from './config/db.js'
import { createApp } from './app.js'
import { getJwtSecret } from './utils/generateToken.js'

// Fail fast on misconfiguration.
try {
  getJwtSecret()
} catch (err) {
  console.error('[sistara-backend]', err.message)
  process.exit(1)
}

const PORT = Number(process.env.PORT) || 5000

const signals = ['SIGINT', 'SIGTERM']
for (const signal of signals) {
  process.once(signal, () => {
    disconnectDB()
      .catch(() => {})
      .finally(() => process.exit(0))
  })
}

try {
  await connectDB()
} catch (err) {
  console.error('[sistara-backend] Could not connect to MongoDB:', err.message)
  process.exit(1)
}

createApp().listen(PORT, () => {
  console.log(`[sistara-backend] API listening on http://localhost:${PORT}`)
})