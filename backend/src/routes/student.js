import express from 'express'   
import { submitForm } from '../controllers/student.controller.js'

const router = express.Router()

router.post('/submit', submitForm)

export default router
