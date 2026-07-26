import express from 'express'   
import { submitForm } from '../controllers/student.controller.js'

const router = express.Router()

router.post('/form/submit', submitForm)

export default router
