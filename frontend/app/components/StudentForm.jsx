'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Home,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  FileText,
  RefreshCw,
  Send,
  Building2,
  Calendar,
  Users,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

export default function StudentForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    jeeRollNo: '',
    gender: '',
    category: '',
    dateOfBirth: '',
    branch: '',
    admissionYear: '2026',
    email: '',
    mobile: '',
    guardianName: '',
    guardianMobile: '',
    address: '',
    state: '',
    pincode: '',
    declaration: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const branches = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Mechatronics Engineering',
    'Information Technology',
    'AI & Data Science',
    'Industrial & Production Engineering'
  ];

  const categories = [
    'General',
    'OBC-NCL',
    'SC',
    'ST',
    'EWS'
  ];

  const states = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 
    'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.jeeRollNo.trim()) {
      newErrors.jeeRollNo = 'JEE Roll Number is required';
    } else if (formData.jeeRollNo.trim().length < 6) {
      newErrors.jeeRollNo = 'Please enter a valid JEE Roll Number';
    }

    if (!formData.gender) newErrors.gender = 'Please select gender';
    if (!formData.category) newErrors.category = 'Please select category';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    if (!formData.branch) newErrors.branch = 'Please select your branch';

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (!formData.guardianName.trim()) newErrors.guardianName = 'Guardian Name is required';
    if (!formData.guardianMobile.trim()) {
      newErrors.guardianMobile = 'Guardian Mobile is required';
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.state) newErrors.state = 'Please select state';
    if (!formData.declaration) newErrors.declaration = 'You must accept the declaration to proceed';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.error-message');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission process
    setTimeout(() => {
      const refNumber = 'HST-' + Math.floor(100000 + Math.random() * 900000);
      setSubmittedData({
        ...formData,
        referenceNo: refNumber,
        submittedAt: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })
      });
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFormData({
      fullName: '',
      jeeRollNo: '',
      gender: '',
      category: '',
      dateOfBirth: '',
      branch: '',
      admissionYear: '2026',
      email: '',
      mobile: '',
      guardianName: '',
      guardianMobile: '',
      address: '',
      state: '',
      pincode: '',
      declaration: false
    });
    setErrors({});
  };

  if (submittedData) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="card-container p-6 sm:p-10 border-t-4" style={{ borderTopColor: 'var(--success)' }}>
          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
            >
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-main)' }}>
              Application Submitted Successfully!
            </h1>
            <p className="text-sm sm:text-base max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              Your hostel allotment application receipt has been recorded.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>
              <FileText className="w-4 h-4" />
              Reference No: {submittedData.referenceNo}
            </div>
          </div>

          {/* Email Notification Flow Banner */}
          <div className="mb-8 p-4 rounded-xl" style={{ backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary-border)' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg mt-0.5" style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}>
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-2 text-sm">
                <h3 className="font-semibold" style={{ color: 'var(--primary-hover)' }}>
                  Email Notifications Workflow
                </h3>
                <div className="space-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--text-main)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }}></span>
                    <span><strong>1st Email (Sent Now):</strong> Confirmation receipt of your submitted application sent to <u>{submittedData.email}</u>.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--warning)' }}></span>
                    <span><strong>2nd Email (Pending Allotment):</strong> Final room allotment status and published list email will follow after admin verification.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Details Summary */}
          <div className="p-6 rounded-xl mb-8 space-y-4" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <h3 className="font-bold text-base flex items-center gap-2 pb-3" style={{ color: 'var(--text-main)', borderColor: 'var(--border)' }}>
              <ShieldCheck className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              Submitted Application Summary
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Full Name</span>
                <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{submittedData.fullName}</span>
              </div>
              <div>
                <span className="block text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>JEE Roll Number</span>
                <span className="font-mono font-semibold" style={{ color: 'var(--text-main)' }}>{submittedData.jeeRollNo}</span>
              </div>
              <div>
                <span className="block text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Gender</span>
                <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{submittedData.gender}</span>
              </div>
              <div>
                <span className="block text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Category</span>
                <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{submittedData.category}</span>
              </div>
              <div>
                <span className="block text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Branch</span>
                <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{submittedData.branch}</span>
              </div>
              <div>
                <span className="block text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Email Address</span>
                <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{submittedData.email}</span>
              </div>
              <div>
                <span className="block text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Mobile Number</span>
                <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{submittedData.mobile}</span>
              </div>
              <div>
                <span className="block text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Submission Date</span>
                <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{submittedData.submittedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-lg text-sm font-medium border flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border)' }}
            >
              <FileText className="w-4 h-4" /> Print Application Receipt
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-lg text-sm font-medium btn-primary flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="card-container mb-8 overflow-hidden">
        <div className="p-6 sm:p-8" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#ffffff' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
  <img
    src="/jec_logo.png"
    alt="College Logo"
    className="w-8 h-8 object-contain"
  />
</span>
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white">
              Academic Session 2026-27
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hostel Allotment Application
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl">
            Please fill out your details carefully. Your application will be verified against official admission records before room allotment.
          </p>
        </div>

        {/* Process Info Note */}
        
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card-container p-6 sm:p-8 space-y-10">
        {/* Section 1: Personal Details */}
        <div className="pt-10">
          <div className="flex items-center gap-3 pb-4" style={{ borderColor: 'var(--border)' }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Personal Information</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Enter your legal personal details as in official documents</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#1f2937' }}>
                Full Name <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Aman Dwivedi"
                className="w-full px-4 py-2.5 text-sm form-input"
              />
              {errors.fullName && <p className="text-xs font-medium error-message" style={{ color: 'var(--error)' }}>{errors.fullName}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#1f2937' }}>
                Gender <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm form-input"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && <p className="text-xs font-medium error-message" style={{ color: 'var(--error)' }}>{errors.gender}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#1f2937' }}>
                Category <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm form-input"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs font-medium error-message" style={{ color: 'var(--error)' }}>{errors.category}</p>}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Date of Birth <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm form-input"
              />
              {errors.dateOfBirth && <p className="text-xs font-medium error-message" style={{ color: 'var(--error)' }}>{errors.dateOfBirth}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Academic Details */}
        <div className="border-t pt-8">
          <div className="flex items-center gap-3 pb-4" style={{ borderColor: 'var(--border)' }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Academic Information</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Required for verifying your admission and merit allotment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* JEE Roll Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                JEE Roll Number <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="jeeRollNo"
                  value={formData.jeeRollNo}
                  onChange={handleChange}
                  placeholder="e.g. 240310123456"
                  className="w-full px-4 py-2.5 text-sm form-input font-mono uppercase"
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>This is your primary lookup key for verification</p>
              {errors.jeeRollNo && <p className="text-xs font-medium error-message" style={{ color: 'var(--error)' }}>{errors.jeeRollNo}</p>}
            </div>

            {/* Branch */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Branch / Program <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm form-input"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {errors.branch && <p className="text-xs font-medium error-message" style={{ color: 'var(--error)' }}>{errors.branch}</p>}
            </div>

            {/* Admission Year */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Admission Year / Batch
              </label>
              <input
                type="text"
                name="admissionYear"
                value={formData.admissionYear}
                readOnly
                className="w-full px-4 py-2.5 text-sm form-input bg-slate-50 cursor-not-allowed"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Guardian Information */}
        <div className="border-t pt-8">
          <div className="flex items-center gap-3 pb-4" style={{ borderColor: 'var(--border)' }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Contact & Guardian Details</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Provide active email and phone numbers for communication</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Student Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Student Email Address <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                className="w-full px-4 py-2.5 text-sm form-input"
              />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Form receipt & allotment results will be sent here</p>
              {errors.email && <p className="text-xs font-medium error-message" style={{ color: 'var(--error)' }}>{errors.email}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Mobile Number <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-2.5 text-sm form-input"
              />
              {errors.mobile && <p className="text-xs font-medium error-message" style={{ color: 'var(--error)' }}>{errors.mobile}</p>}
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Home State <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm form-input"
              >
                <option value="">Select State</option>
                {states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              {errors.state && <p className="text-xs font-medium error-message" style={{ color: 'var(--error)' }}>{errors.state}</p>}
            </div>

            {/* Pincode */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                className="w-full px-4 py-2.5 text-sm form-input"
              />
            </div>
          </div>
        </div>

        {/* Declaration & Submission */}
        <div className="border-t pt-8">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="declaration"
              name="declaration"
              checked={formData.declaration}
              onChange={handleChange}
              className="mt-1 w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="declaration" className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-main)' }}>
              I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that room allotment is strictly subject to verification against official admission records and merit rank capacity.
            </label>
          </div>
          {errors.declaration && <p className="text-xs font-medium error-message" style={{ color: 'var(--error)' }}>{errors.declaration}</p>}

          <div className="flex items-center justify-end gap-4 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-lg text-sm font-medium border"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg text-sm font-medium btn-primary flex items-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Application
                </>
              )}
            </button>
          </div>
        </div>
        </div>
      </form>
    </div>
  );
}
