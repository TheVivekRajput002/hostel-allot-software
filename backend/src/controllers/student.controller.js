import prisma from '../db/db.js'


const submitForm = async (req ,res)=>{
    try{
        const {fullName, gender,category, Dob,RollNo,MobileNo,Branch,HomeState,Pincode} = req.body;
        if (
            [fullName, gender,category, Dob,RollNo,MobileNo,Branch,HomeState,Pincode].some(
                (field) => field?.trim() === ""
            )
        ) {
            return res.status(400).json('Enter all fileds');
        }
        const existingStudent = await prisma.HostelForm.findUnique({
            where: {
                RollNo: RollNo,
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
                Dob:Dob,
                RollNo:RollNo,
                MobileNo:MobileNo,
                Branch:Branch,
                HomeState:HomeState,
                Pincode:Pincode
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

export {
    submitForm
}