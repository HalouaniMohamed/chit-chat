var bcrypt = require('bcryptjs')

const hashPassword = async password => {
  const hashedPassword = await bcrypt.hash(password, 12)
  return hashedPassword
}

const verifyPassword = async (password, hashedPassword) => {
  const isValid = await bcrypt.compare(password, hashedPassword)
  return isValid
}

module.exports = { hashPassword, verifyPassword }
