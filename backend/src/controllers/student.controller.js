import prisma from '../db/db.js'

export const submitForm = async (req, res) => {
    const body = {
        "fullName": "Vivek Rajput",
        "gender": "MALE",
        "category": "OBC",
        "jeeRollNumber": "JEE24010001",
        "branch": "Information Technology",
        "admissionYear": 2024,
        "email": "vivek.rajput@example.com",
        "mobileNumber": "9876543210",
        "homeState": "Madhya Pradesh"
    }

    const result =  await prisma.hostelForm.create({
        data: body
    })

    console.log(result)

}
