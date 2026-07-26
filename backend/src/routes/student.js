import express from 'express'   
import { submitForm } from '../controllers/student.controller.js'

const router = express.Router()

router.post('/form', submitForm)

export default router
