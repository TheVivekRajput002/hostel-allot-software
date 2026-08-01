const normalizeName = (name) =>
  String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const isCancelled = (finalStatus) =>
  String(finalStatus || '').trim().toLowerCase() === 'cancelled';

/**
 * Compare a hostel form against the matched admission (student) record.
 * Returns whether the form passes all checks and a list of human-readable failure reasons.
 */
export function evaluateHostelFormVerification(form, student) {
  const reasons = [];

  if (!student) {
    reasons.push('Roll number not found in official admission records.');
    return { isVerified: false, reasons };
  }

  if (isCancelled(student.finalStatus)) {
    reasons.push('Admission record is marked as cancelled.');
  }

  if (normalizeName(form.fullName) !== normalizeName(student.name)) {
    reasons.push(
      `Name mismatch: form has "${form.fullName}", admission has "${student.name}".`
    );
  }

  if (form.gender !== student.gender) {
    reasons.push(
      `Gender mismatch: form has "${form.gender}", admission has "${student.gender}".`
    );
  }

  if (form.category !== student.allotedCategory) {
    reasons.push(
      `Category mismatch: form has "${form.category}", admission has "${student.allotedCategory}".`
    );
  }

  if (student.marks == null) {
    reasons.push('Marks missing in admission record.');
  }

  if (student.rank == null) {
    reasons.push('Rank missing in admission record.');
  }

  if (!String(student.phoneNo || '').trim()) {
    reasons.push('Phone number missing in admission record.');
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
