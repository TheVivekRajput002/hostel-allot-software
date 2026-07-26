import prisma from '../db/db.js'


const submitForm = async (req ,res)=>{
    try{
        const {fullName, gender,category,jeeRollNumber,mobileNumber,email,homeState,admissionYear,branch} = req.body;
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
            return res.status(409).json("You have already applied.");
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
            return res.status(400).json("Error while saving Details.")
        }
        return res.status(200).json({
            "Data: ":newStudent,
            "message":"Student data saved."
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
    fetchStudentDetails
}