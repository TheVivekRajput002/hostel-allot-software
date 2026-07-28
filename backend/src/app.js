import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import cors from 'cors'
import studentRouter from './routes/student.routes.js'
import adminRouter from './routes/admin.routes.js'
dotenv.config()

const app = express()
app.use(morgan('dev'))
app.use(cors({
    origin: ['https://hostel-allot-software.vercel.app', 'http://localhost:3000'],
    credentials: true
}))
app.get('/', (req, res) => {
    res.json({ message: "Hello World" })
})

app.use(express.json())
app.use('/api/students', studentRouter)
app.use('/api/admin', adminRouter)


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})