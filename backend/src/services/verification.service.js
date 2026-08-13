const normalizeName = (name) =>
  String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const isCancelled = (finalStatus) =>
  String(finalStatus || '').trim().toLowerCase() === 'cancelled';

const cleanPhone = (phone) => String(phone || '').replace(/\D/g, '');

/**
 * Compare a hostel form against the matched admission (student) record.
 * Returns whether the form passes all checks and a list of human-readable failure reasons.
 */
export function evaluateHostelFormVerification(form, student) {
  const reasons = [];

  if (!student) {
    reasons.push('roll number not found');
    return { isVerified: false, reasons };
  }

  if (isCancelled(student.finalStatus)) {
    reasons.push('admission cancelled');
  }

  if (normalizeName(form.fullName) !== normalizeName(student.name)) {
    reasons.push('name not matched');
  }

  if (form.gender !== student.gender) {
    reasons.push('gender not matched');
  }

  if (form.category !== student.allotedCategory) {
    reasons.push('category not matched');
  }

  if (cleanPhone(form.mobileNumber) !== cleanPhone(student.phoneNo)) {
    reasons.push('phone number not matched');
  }

  if (normalizeName(form.homeState) !== normalizeName(student.domicileStatus)) {
    reasons.push('home state not matched');
  }

  if (student.marks == null) {
    reasons.push('marks missing');
  }

  if (student.rank == null) {
    reasons.push('crl rank not matched');
  }
  
  return {
    isVerified: reasons.length === 0,
    reasons,
  };
}

export function formatVerificationReasons(reasons) {
  if (!reasons?.length) return null;
  return reasons.join(' | ');
}

export function parseVerificationReasons(reasonString) {
  if (!reasonString?.trim()) return [];
  return reasonString.split(' | ').filter(Boolean);
}
