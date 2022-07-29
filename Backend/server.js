const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const { notFound, errorHandler } = require('./middlewares/errorMiddleware')
dotenv.config()
connectDB()
const app = express()
app.use(express.json())
const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server started on PORT ${PORT}`)) // to accept json data

// app.get('/' , (req,res) => {
//   res.send('API is working')
// })

app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use(notFound)
app.use(errorHandler)
