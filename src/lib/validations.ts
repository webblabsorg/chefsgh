import { z } from 'zod';

export const membershipSelectionSchema = z.object({
  membership_type_id: z.string().min(1, 'Please select a membership type'),
  membership_slug: z.enum(['professional', 'corporate', 'associate', 'vendor', 'student']),
});

export const personalInfoSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  date_of_birth: z.date({
    required_error: 'Date of birth is required',
  }),
  gender: z.enum(['male', 'female', 'prefer_not_to_say']),
  nationality: z.string().min(2, 'Nationality is required'),
  id_type: z.enum(['ghana_card', 'passport', 'voter_id', 'driver_license']),
  id_number: z.string().min(5, 'ID number is required'),
});

export const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone_number: z.string().regex(/^\+233\d{9}$/, 'Phone number must be in format +233XXXXXXXXX'),
  alternative_phone: z.string().regex(/^\+233\d{9}$/, 'Phone number must be in format +233XXXXXXXXX').optional().or(z.literal('')),
  street_address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  region: z.string().min(2, 'Region is required'),
  digital_address: z.string().optional(),
});

export const professionalMemberSchema = z.object({
  current_position: z.string().min(2, 'Current position is required'),
  current_employer: z.string().min(2, 'Current employer is required'),
  years_of_experience: z.string().min(1, 'Years of experience is required'),
  culinary_specialization: z.array(z.string()).min(1, 'Select at least one specialization'),
  qualifications: z.array(z.object({
    institution: z.string().min(2, 'Institution name is required'),
    certificate: z.string().min(2, 'Certificate/degree is required'),
    year: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
  })).min(1, 'At least one qualification is required'),
  certifications: z.array(z.string()).optional(),
});

export const corporateMemberSchema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  business_type: z.string().min(2, 'Business type is required'),
  registration_number: z.string().min(2, 'Registration number is required'),
  number_of_employees: z.string().min(1, 'Number of employees is required'),
  years_in_operation: z.string().min(1, 'Years in operation is required'),
  business_address: z.string().min(5, 'Business address is required'),
  contact_person_name: z.string().min(2, 'Contact person name is required'),
  contact_person_position: z.string().min(2, 'Contact person position is required'),
  business_website: z.string().url('Invalid URL').optional().or(z.literal('')),
  business_logo: z.string().optional(),
});

export const associateMemberSchema = z.object({
  occupation: z.string().min(2, 'Occupation is required'),
  areas_of_interest: z.array(z.string()).min(1, 'Select at least one area of interest'),
  reason_for_joining: z.string().min(20, 'Please provide at least 20 characters'),
});

export const vendorMemberSchema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  products_services: z.string().min(10, 'Please describe your products/services'),
  registration_number: z.string().min(2, 'Registration number is required'),
  years_in_business: z.string().min(1, 'Years in business is required'),
  primary_contact: z.string().min(2, 'Primary contact is required'),
  business_website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const studentMemberSchema = z.object({
  institution_name: z.string().min(2, 'Institution name is required'),
  program: z.string().min(2, 'Program/course is required'),
  expected_graduation: z.string().min(1, 'Expected graduation date is required'),
  student_id_number: z.string().min(2, 'Student ID number is required'),
  student_id_card: z.string().optional(),
});

export const emergencyContactSchema = z.object({
  emergency_contact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    relationship: z.string().min(2, 'Relationship is required'),
    phone: z.string().regex(/^\+233\d{9}$/, 'Phone number must be in format +233XXXXXXXXX'),
  }),
});

export const termsSchema = z.object({
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  code_of_conduct_accepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the code of conduct',
  }),
  data_privacy_accepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the data privacy policy',
  }),
});
