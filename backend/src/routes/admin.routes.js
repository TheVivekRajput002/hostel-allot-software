import express from 'express'   
import { allotmentRun } from '../controllers/admin.controller.js'
const router = express.Router()

router.post('/allotment/run', allotmentRun)

export default router
