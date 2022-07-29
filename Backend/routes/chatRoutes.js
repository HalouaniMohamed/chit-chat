const express = require('express')
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup
} = require('../controllers/chatControllers')
const { protect } = require('../middlewares/authMiddleware')

const router = express.Router()

router.route('/').post(protect, accessChat)
router.route('/').get(protect, fetchChats)
router.route('/group').post(protect, createGroupChat)
router.route('/renamegroup').put(protect, renameGroupChat)
router.route('/addtogroup').put(protect, addToGroup)
router.route('/removefromgroup').put(protect, removeFromGroup)

module.exports = router
