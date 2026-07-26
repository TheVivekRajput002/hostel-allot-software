
Student form submit
POST   /api/v1/students/form

fetch a student submitted form to view
GET    /api/v1/students/form/{jeeRollNumber}

upload admission data csv
POST   /api/v1/admin/admission-data/upload

verification of student form with admission data
POST   /api/v1/admin/verification/run

take empty hostel rooms data
POST   /api/v1/admin/inventory/

run allotment algorithm
POST   /api/v1/admin/allotment/run


fetch all allotted students list
GET    /api/v1/admin/allotment/{gender}

fetch allotment status of a student
GET    /api/v1/students/allotment/{jeeRollNumber}

send email for form submitted succesfully
POST   /api/v1/notifications/acknowledgement

