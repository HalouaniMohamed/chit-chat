const express = require('express')
const { protect } = require('../middlewares/authMiddleware')
const {
  registerUser,
  authUser,
  allUsers
} = require('../controllers/userControllers')

const router = express.Router()

router.route('/signup').post(registerUser)
router.post('/login', authUser)
router.route('/').get(protect, allUsers)

module.exports = router
