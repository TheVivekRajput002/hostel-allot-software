import prisma from '../db/db.js'
import nodemailer from 'nodemailer';
import { sendEmail } from '../services/notifications.service.js';





const submitForm = async (req ,res)=>{
    try{
        let {fullName, gender,category,jeeRollNumber,mobileNumber,email,homeState,admissionYear,branch} = req.body;

        // Parse admissionYear as integer
        if (admissionYear !== undefined && admissionYear !== null && admissionYear !== "") {
            const parsed = parseInt(admissionYear, 10);
            admissionYear = isNaN(parsed) ? null : parsed;
        } else {
            admissionYear = null;
        }

        // Normalize gender
        if (gender) {
            const gUpper = String(gender).trim().toUpperCase();
            if (gUpper === 'MALE' || gUpper === 'M') {
                gender = 'MALE';
            } else if (gUpper === 'FEMALE' || gUpper === 'F') {
                gender = 'FEMALE';
            }
        }

        // Normalize category
        if (category) {
            const cUpper = String(category).trim().toUpperCase();
            if (cUpper === 'GENERAL' || cUpper === 'GEN') {
                category = 'GENERAL';
            } else if (cUpper === 'OBC-NCL' || cUpper === 'OBC') {
                category = 'OBC';
            } else if (cUpper === 'SC') {
                category = 'SC';
            } else if (cUpper === 'ST') {
                category = 'ST';
            } else if (cUpper === 'EWS') {
                category = 'EWS';
            } else if (cUpper === 'JK_MIGRANT_NORTHEAST' || cUpper.includes('JK') || cUpper.includes('NORTHEAST')) {
                category = 'JK_MIGRANT_NORTHEAST';
            }
        }

        const fields = [fullName, gender, category, jeeRollNumber, mobileNumber, email, homeState, admissionYear, branch];

        const hasEmptyFields = fields.some(
            (field) => field === undefined || field === null || String(field).trim() === ""
        );

        if (hasEmptyFields) {
          return res.status(400).json({ message: 'Enter all fields' });
        }
        const existingStudent = await prisma.HostelForm.findUnique({
            where: {
                jeeRollNumber: jeeRollNumber,
            },
        });
        if (existingStudent) {
            return res.status(409).json({message:"You have already applied."});
        }
        const existingEmail = await prisma.HostelForm.findUnique({
            where: {
                email: email,
            },
        });
        if (existingEmail) {
            return res.status(409).json({message:"This email has already been used to apply."});
        }
        const newStudent = await prisma.HostelForm.create({
            data: {
                fullName:fullName,
                gender:gender,
                category:category,
                jeeRollNumber:jeeRollNumber,
                mobileNumber:mobileNumber,
                email:email,
                homeState:homeState,
                admissionYear:admissionYear,
                branch:branch
            },
        });
        if(!newStudent){
            return res.status(400).json({message:"Error while saving Details."});
        }
        let emailSent = false;
        try {
            const info = await sendEmail(email, "Form Submission Confirmation Receipt!", newStudent.id);
            if (info) emailSent = true;
        } catch (emailError) {
            console.log("Email sending failed:", emailError.message);
        }

        return res.status(200).json({
            "Data: ": newStudent,
            "message": emailSent
                ? "Student data saved & confirmation email sent successfully."
                : "Student data saved successfully. Confirmation email could not be sent."
        })
        
    }
    catch(error) {
        console.log(Error, error);
        res.status(500).json({
            message:'Internal Sever Error',
            error:error.message
        })

   }
}

const fetchAllForms = async (req, res) => {
    try {
        const forms = await prisma.hostelForm.findMany();
        
        // Fetch matching Student records for all forms
        const rollNumbers = forms.map(f => f.jeeRollNumber);
        const students = await prisma.student.findMany({
            where: {
                rollNo: {
                    in: rollNumbers
                }
            }
        });
        
        // Create a lookup map of student records by rollNo
        const studentMap = {};
        students.forEach(s => {
            studentMap[s.rollNo] = s;
        });
        
        // Merge forms with studentInfo
        const mergedForms = forms.map(f => {
            const studentInfo = studentMap[f.jeeRollNumber] || null;
            return {
                ...f,
                studentInfo: studentInfo
            };
        });

        return res.status(200).json({
            Data: mergedForms,
            message: "Hostel forms fetched successfully."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}


const fetchStudentDetails = async (req, res) => {
    try {
        const { searchKey } = req.params; // e.g. /student/123 or /student/JEE2024001

        const studentDetails = await prisma.hostelForm.findFirst({
            where: {
                OR: [
                    { jeeRollNumber: searchKey },
                    { id: searchKey } 
                ]
            }
        });
        if (!studentDetails) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json({Data:studentDetails,message:"Student data fetched successfully."});
    } catch (error) {
        console.log(Error, error);
        res.status(500).json({
            message:'Internal Sever Error',
            error:error.message
        })
    }
}


export {
    submitForm,
    fetchStudentDetails,
    fetchAllForms
}