const AsyncHandler = require('express-async-handler')
const Chat = require('../models/chatModel')
const User = require('../models/userModel')

const accessChat = AsyncHandler(async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    console.log('userId param not sent with request')
    return res.sendStatus(400)
  }
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { eq: req.user._id } } },
      { users: { $elemMatch: { eq: userId } } }
    ]
  })
    .populate('users', '-password')
    .populate('latestMessage')
  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name pic email'
  })
  if (isChat.length > 0) {
    res.send(isChat[0])
  } else {
    var chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId]
    }
    try {
      const createdChat = await Chat.create(chatData)
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      )
      res.status(200).send(FullChat)
    } catch (error) {
      res.status(400)
      throw new Error(error.message)
    }
  }
})

const fetchChats = AsyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async results => {
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'name pic email'
        })
        res.status(200).send(results)
      })
    // .then(result => res.send(result))
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})

const createGroupChat = AsyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: ' Please Fill all the fiels' })
  }
  var users = JSON.parse(req.body.users)
  if (users.length < 2) {
    return res
      .status(400)
      .send('More than 2 users are requires to form a group chat')
  }
  users.push(req.user)

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users,
      isGroupChat: true,
      groupAdmin: req.user
    })
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
    res.status(201).json(fullGroupChat)
  } catch (error) {
    res.staus(400)
    throw new Error(error.message)
  }
})

const renameGroupChat = AsyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName
    },
    { new: true }
  )
    .populate('users', '-passowrd')
    .populate('groupAdmin', '-password')
  if (!updatedChat) {
    res.status(404).json({ message: 'Chat Not Found' })
    throw new Error('Chat Not Found')
  } else {
    res.json(updatedChat)
  }
})
const addToGroup = AsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body
  const addedUser = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')
  if (!addedUser) {
    res.status(404).message('chat not found')
    throw new Error('chat not found')
  } else {
    res.json(addedUser)
  }
})
const removeFromGroup = AsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body
  const removedUser = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password')
  if (!removedUser) {
    res.status(404).message('chat not found')
    throw new Error('chat not found')
  } else {
    res.json(removedUser)
  }
})

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup
}
