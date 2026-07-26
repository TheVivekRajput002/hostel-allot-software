import prisma from '../db/db.js'
import {allocateHostelSeats} from '../services/hostelAllocation.js'

const allotmentRun = async (req ,res)=>{
    try{
        const rollNumbers = await prisma.HostelForm.findMany({
            where: {
                isVerified: true,
            },
        });
        if(!rollNumbers.length==0){
            return res.status(400).json({message:"Please verify the students first."});
        }
        const student = await prisma.student.findMany({
            where: {
                jeeRollNumber: {
                    in: rollNumbers.map((student) => student.jeeRollNumber),
                },
            },
        });
        const studentMale = student.filter((student) => student.gender === 'MALE');
        const studentFemale = student.filter((student) => student.gender === 'FEMALE');
        const emptyFemaleRooms = await  prisma.hostel.findone({
            where: {
                gender: 'FEMALE',
            },
        });
        const emptyMaleRooms = await  prisma.hostel.findone({
            where: {
                gender: 'MALE',
            },
        });
        const emptyMaleRoomsNumber = emptyMaleRooms.rooms;
        const emptyFemaleRoomsNumber = emptyFemaleRooms.rooms;
        const allocatedMaleSeats = await allocateHostelSeats(studentMale, emptyMaleRoomsNumber);
        const allocatedFemaleSeats = await allocateHostelSeats(studentFemale, emptyFemaleRoomsNumber);

        return res.status(200).json({
            "Male Students Allotted: ":allocatedMaleSeats,
            "Female Students Allotted: ":allocatedFemaleSeats,
            "message":"Hostel Allotment Completed Successfully."
        })
    }catch(error) {
        console.log(Error, error);
        res.status(500).json({message:"Internal Server Error"});
    }
}




export { allotmentRun }