
import express from 'express'
import multer from 'multer'
import { uploadAdmissionData, runVerification, getAllotedStudentsByGender, getHostelInventory, updateHostelInventory, removeGeneratedList } from '../controllers/admin.controller.js'
import { allotmentRun } from '../controllers/admin.controller.js'
const router = express.Router()

router.post('/allotment/run', allotmentRun)
router.post('/admission-data', upload.single('csvFile'), uploadAdmissionData)
router.post('/verification/run', runVerification)
router.get('/allotment/:gender', getAllotedStudentsByGender)
router.get('/inventory', getHostelInventory)
router.post('/inventory', updateHostelInventory)
router.delete('/deletegeneratedList',removeGeneratedList)

export default router
