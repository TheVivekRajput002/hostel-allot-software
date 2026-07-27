import xlsx from 'xlsx';

const csvContent = 
`s.no,JEE Roll No,Candidate Name,Sex,Allot Category,eligible category,admission date,rank,mobile
1,TESTROLL001,Amit Kumar Sharma,Male,OBC-NCL,GEN,2026-07-28,12450,+91 9999988888
2,TESTROLL002,Priya Patel,Female,GEN,GEN,2026-07-28,4510,+91 9999977777`;

const csvBuffer = Buffer.from(csvContent, 'utf-8');

try {
  // Let's try parsing directly
  const workbook = xlsx.read(csvBuffer, { type: 'buffer' });
  console.log('SheetNames:', workbook.SheetNames);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  console.log('Rows parsed directly:', rows);
} catch (err) {
  console.error('Error parsing directly:', err);
}
