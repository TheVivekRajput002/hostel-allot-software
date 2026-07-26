import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.get('/', (req, res) => {
    res.json({message: "Hello World"})
})

app.post('/form', )

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})