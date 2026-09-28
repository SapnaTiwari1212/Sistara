import bcrypt from 'bcryptjs'
import { ApiError } from '../utils/apiError.js'
import { generateToken } from '../utils/generateToken.js'
import { isEmail, isPhone } from '../utils/validators.js'
import { User } from '../models/User.js'

const BCRYPT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 8

/** The shape every auth response returns — never includes the hash. */
export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  role: user.role,
  provider: user.provider,
  createdAt: user.createdAt,
})

export const register = async (req, res) => {
  const { name, email, phone, password } = req.body || {}

  const clean = {
    name: String(name || '').trim(),
    email: String(email || '').trim().toLowerCase(),
    phone: String(phone || '').trim(),
    password: String(password || ''),
  }

  if (clean.name.length < 2) throw new ApiError(400, 'Please tell us your name.')
  if (!isEmail(clean.email)) throw new ApiError(400, 'Enter a valid email address.')
  if (!isPhone(clean.phone)) throw new ApiError(400, 'Enter a valid 10-digit phone number.')
  if (clean.password.length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
  }

  const existing = await User.findOne({ email: clean.email })
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.')
  }

  const passwordHash = await bcrypt.hash(clean.password, BCRYPT_ROUNDS)
  const user = await User.create({
    name: clean.name,
    email: clean.email,
    phone: clean.phone,
    passwordHash,
    role: 'user',
  })

  res.status(201).json({ token: generateToken(user), user: publicUser(user) })
}

export const login = async (req, res) => {
  const { email, password } = req.body || {}
  const cleanEmail = String(email || '').trim().toLowerCase()
  const cleanPassword = String(password || '')

  if (!isEmail(cleanEmail) || !cleanPassword) {
    throw new ApiError(401, 'Invalid email or password.')
  }

  // select passwordHash explicitly: the schema keeps it hidden by default.
  const user = await User.findOne({ email: cleanEmail }).select('+passwordHash')
  if (!user?.passwordHash) throw new ApiError(401, 'Invalid email or password.')

  const matches = await bcrypt.compare(cleanPassword, user.passwordHash)
  if (!matches) throw new ApiError(401, 'Invalid email or password.')

  res.json({ token: generateToken(user), user: publicUser(user) })
}

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) throw new ApiError(404, 'Account not found.')
  res.json({ user: publicUser(user) })
}