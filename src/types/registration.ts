export interface MembershipType {
  id: string;
  name: string;
  slug: MembershipSlug;
  price: number;
  description: string;
  benefits: string[];
  is_active: boolean;
}

export type MembershipSlug = 'professional' | 'corporate' | 'associate' | 'vendor' | 'student';

export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export type IdType = 'ghana_card' | 'passport' | 'voter_id' | 'driver_license';

export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface ProfessionalMemberInfo {
  current_position: string;
  current_employer: string;
  years_of_experience: string;
  culinary_specialization: string[];
  qualifications: {
    institution: string;
    certificate: string;
    year: string;
  }[];
  certifications?: string[];
}

export interface CorporateMemberInfo {
  business_name: string;
  business_type: string;
  registration_number: string;
  number_of_employees: string;
  years_in_operation: string;
  business_address: string;
  contact_person_name: string;
  contact_person_position: string;
  business_website?: string;
  business_logo?: string;
}

export interface AssociateMemberInfo {
  occupation: string;
  areas_of_interest: string[];
  reason_for_joining: string;
}

export interface VendorMemberInfo {
  company_name: string;
  products_services: string;
  registration_number: string;
  years_in_business: string;
  primary_contact: string;
  business_website?: string;
}

export interface StudentMemberInfo {
  institution_name: string;
  program: string;
  expected_graduation: string;
  student_id_number: string;
  student_id_card?: string;
}

export type ProfessionalInfo =
  | ProfessionalMemberInfo
  | CorporateMemberInfo
  | AssociateMemberInfo
  | VendorMemberInfo
  | StudentMemberInfo;

export interface RegistrationFormData {
  membership_type_id: string;
  membership_slug: MembershipSlug;

  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: Date | null;
  gender: Gender;
  nationality: string;
  id_type: IdType;
  id_number: string;

  email: string;
  phone_number: string;
  alternative_phone?: string;
  street_address: string;
  city: string;
  region: string;
  digital_address?: string;

  professional_info: ProfessionalInfo | Record<string, never>;

  emergency_contact: EmergencyContact;

  profile_photo?: File | null;
  profile_photo_url?: string;
  documents?: File[];

  terms_accepted: boolean;
  code_of_conduct_accepted: boolean;
  data_privacy_accepted: boolean;
}

export interface Registration extends Omit<RegistrationFormData, 'profile_photo' | 'documents'> {
  id: string;
  membership_id: string;
  registration_date: string;
  membership_expiry: string;
  payment_status: PaymentStatus;
  payment_reference?: string;
  payment_amount: number;
  profile_photo_url: string;
  documents: string[];
  created_at: string;
  updated_at: string;
}
