import express from "express"
import { sendMessage } from '../controllers/messagesController'

const messagesRoutes = express.Router()

messagesRoutes.post('/sendMessage', sendMessage)

export default messagesRoutes