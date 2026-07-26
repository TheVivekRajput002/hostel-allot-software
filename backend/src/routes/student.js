import express from 'express'   
import { submitForm ,fetchStudentDetails} from '../controllers/student.controller.js'
const router = express.Router()

router.post('/form', submitForm)
router.get('/:searchKey', fetchStudentDetails)

export default router
