import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import messagesRouter from './routers/messagesRouter'

const app = express()
dotenv.config()

app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(helmet())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

app.use('/messages', messagesRouter)

app.use((req, res) => { res.status(404).json({error: 'Не найдено'}) })

app.use((err, req, res, next) => {
  console.log(err)
  if (err.status) { return res.status(err.status).json({error: err.message}) }
  return res.status(500).json({error: 'Внутренняя ошибка сервера'})
})

app.listen(4000, () => { console.log('Сервер запущен на http://localhost:4000') })
