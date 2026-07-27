import express from 'express'   
import { submitForm, fetchStudentDetails, fetchAllForms } from '../controllers/student.controller.js'
const router = express.Router()

router.post('/form', submitForm)
router.get('/form', fetchAllForms)
router.get('/form/:searchKey', fetchStudentDetails)

export default router
