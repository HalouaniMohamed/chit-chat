const asyncHandler = require('express-async-handler')
const { verifyPassword } = require('../config/bcrypt')
const generateToken = require('../config/generateToken')
const User = require('../models/userModel')

const registerUser = asyncHandler(async (req, res) => {
  console.log('yaaaaaaay')
  const { name, email, password, pic } = req.body
  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Please enter all the fields')
    return
  }
  const userExists = await User.findOne({ email: email })
  if (userExists) {
    res.status(400).json({ message: 'Email already exists' })
    throw new Error('Email already exists')
    return
  }
  const user = await User.create({ name, email, password, pic })
  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      pic: user.pic,
      token: generateToken(user._id)
    })
    return
  } else {
    res.status(400).json({ message: 'Failed to create user' })
    throw new Error('Failed to create user')
    return
  }
})

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email })
  if (user) {
    const isValid = await verifyPassword(password, user.password)
    if (isValid) {
      res
        .status(200)
        .json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          pic: user.pic,
          token: generateToken(user._id)
        })
      return
    } else {
      res.status(400)
      throw new Error('Incorrect password')
      return
    }
  } else {
    res.status(404)
    throw new Error('No user with this email')
    return
  }
})

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } }
        ]
      }
    : {}
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
  res.send(users)
})
module.exports = { registerUser, authUser, allUsers }
