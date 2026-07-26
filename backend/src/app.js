import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import studentRouter from './routes/student.js'

dotenv.config()

const app = express()
app.use(morgan('dev'))
app.get('/', (req, res) => {
    res.json({message: "Hello World"})
})

app.use(express.json())
app.use('/form',studentRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})