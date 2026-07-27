
Student form submit
POST   /api/students/form

fetch a student submitted form to view
GET    /api/students/form/{jeeRollNumber or ID}

fetch a student submitted form to view
GET    /api/students/form

upload admission data csv
POST   /api/admin/admission-data

verification of student form with admission data
POST   /api/admin/verification/run

take empty hostel rooms data
POST   /api/admin/inventory/

run allotment algorithm
POST   /api/admin/allotment/run

fetch all allotted students list
GET    /api/admin/allotment/{gender}

send email for form submitted succesfully
POST   /api/notifications/acknowledgement

