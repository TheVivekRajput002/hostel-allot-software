import express from 'express'
import multer from 'multer'
import { uploadAdmissionData, runVerification, getAllotedStudentsByGender } from '../controllers/admin.controller.js'

const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router();

router.post('/admission-data', upload.single('csvFile'), uploadAdmissionData)
router.get('/verification/run', runVerification)
router.get('/allotment/:gender', getAllotedStudentsByGender)

export default router