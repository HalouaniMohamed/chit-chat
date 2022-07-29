const jwt = require('jsonwebtoken')
const User = require('../models/userModel.js')
const asyncHandler = require('express-async-handler')

const protect = asyncHandler(async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      //decode token id
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      res.sendStatus(401).send('not authorized, token failed')
      throw new Error('not authorized, token failed')
    }
  }
  if (!token) {
    res.sendStatus(401).send('not authorized, no token')
    throw new Error('not authorized , no token')
  }
})

module.exports = { protect }
