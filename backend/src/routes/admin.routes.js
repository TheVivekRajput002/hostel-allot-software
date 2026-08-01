
import express from 'express'
import multer from 'multer'
import { uploadAdmissionData, runVerification, getAdminMetrics, getAllotedStudentsByGender, getHostelInventory, updateHostelInventory } from '../controllers/admin.controller.js'
import { allotmentRun } from '../controllers/admin.controller.js'

const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()

router.get('/metrics', getAdminMetrics)
router.post('/allotment/run', allotmentRun)
router.post('/admission-data', upload.single('csvFile'), uploadAdmissionData)
router.post('/verification/run', runVerification)
router.get('/allotment/:gender', getAllotedStudentsByGender)
router.get('/inventory', getHostelInventory)
router.post('/inventory', updateHostelInventory)

export default router
