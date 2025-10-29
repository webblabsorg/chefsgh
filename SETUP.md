# Ghana Chefs Association - Registration Form Setup

## Overview
This is a professional, production-ready membership registration system for the Ghana Chefs Association. The application features a multi-step form with integrated Paystack payment processing and Supabase backend.

## Features
- ✅ Beautiful multi-step registration form with progress indicator
- ✅ 5 membership types with dynamic pricing cards
- ✅ Dynamic professional forms based on membership type
- ✅ File upload with preview (profile photos, documents)
- ✅ Comprehensive form validation
- ✅ Paystack payment integration
- ✅ Supabase database with RLS policies
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Success page with membership details

## Membership Types
1. **Professional Membership** - GH₵350 (for qualified chefs)
2. **Corporate Membership** - GH₵450 (for businesses)
3. **Associate Membership** - GH₵250 (for enthusiasts)
4. **Vendor Membership** - GH₵150 (for suppliers)
5. **Student Membership** - GH₵50 (for students)

## Setup Instructions

### 1. Configure Paystack
To enable payments, you need to add your Paystack public key to the `.env` file:

```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_paystack_key_here
```

To get your Paystack key:
1. Create a Paystack account at https://dashboard.paystack.com/signup
2. Log in and navigate to Settings > API Keys & Webhooks
3. Copy your Public Key (starts with `pk_test_` for test mode or `pk_live_` for production)
4. Replace the placeholder in `.env` with your actual key

### 2. Database Setup
The database has been automatically configured with:
- ✅ Membership types table (pre-populated with 5 types)
- ✅ Registrations table with all required fields
- ✅ File uploads tracking table
- ✅ Storage bucket for profile photos and documents
- ✅ Row Level Security (RLS) policies
- ✅ Automatic membership ID generation

### 3. Test the Application
1. Navigate through the 4-step registration process
2. Select a membership type
3. Fill in personal and contact information
4. Complete professional details based on membership type
5. Upload profile photo (and student ID for student members)
6. Review information and accept terms
7. Complete payment via Paystack

### 4. View Registrations
Query the database to view registrations:
```sql
SELECT
  membership_id,
  first_name,
  last_name,
  email,
  phone_number,
  payment_status,
  registration_date
FROM registrations
ORDER BY registration_date DESC;
```

## Form Steps

### Step 1: Membership Selection
- Beautiful pricing cards for all 5 membership types
- Shows price, description, and key benefits
- Visual selection indicator

### Step 2: Personal & Contact Information
- Personal details (name, DOB, gender, nationality, ID)
- Contact details (email, phone, address)
- Ghana regions dropdown
- Phone number format validation (+233XXXXXXXXX)

### Step 3: Professional Information
Dynamic forms based on membership type:

**Professional Members:**
- Current position and employer
- Years of experience
- Culinary specializations (multi-select)
- Qualifications with institution, certificate, and year
- Emergency contact
- Profile photo

**Corporate Members:**
- Business details and registration
- Number of employees
- Contact person information
- Business logo

**Associate Members:**
- Occupation
- Areas of interest (multi-select)
- Reason for joining (text area)

**Vendor Members:**
- Company information
- Products/services offered
- Years in business

**Student Members:**
- Institution and program
- Expected graduation date
- Student ID number
- Student ID card upload (required)

### Step 4: Review & Payment
- Review all entered information
- Edit button to go back and modify
- Terms and conditions (3 checkboxes)
- Payment summary
- Paystack payment integration

## Success Flow
After successful payment:
- Membership ID is automatically generated (format: GCA-2025-0001)
- Registration is saved to database
- Success page displays membership details
- Membership valid for 1 year from registration

## Color Scheme
- **Primary**: Teal (#0F766E) - Main actions, headers
- **Accent**: Gold (#F59E0B) - Highlights, badges
- **Success**: Green (#10B981) - Success states
- **Error**: Red (#EF4444) - Error states

## File Upload Limits
- Profile Photo: 2MB (JPG, PNG)
- Certificates: 5MB (JPG, PNG, PDF)
- Student ID: 3MB (JPG, PNG)
- Business Logo: 2MB (JPG, PNG)

## Important Notes
1. **Paystack Test Mode**: Use test cards for testing:
   - Card: 4084 0840 8408 4081
   - CVV: 408
   - Expiry: Any future date
   - PIN: 0000

2. **No Email Confirmation**: The system does NOT send email confirmations (as specified in requirements)

3. **Data Security**: All tables have Row Level Security enabled with appropriate policies

4. **File Storage**: Files are stored in Supabase Storage with public access

## Troubleshooting

### Payment Not Working
- Ensure VITE_PAYSTACK_PUBLIC_KEY is set correctly
- Check browser console for errors
- Verify Paystack script is loaded (check Network tab)

### File Upload Fails
- Check file size limits
- Ensure file type is supported
- Verify storage bucket exists

### Form Validation Errors
- All required fields must be filled
- Phone numbers must be in format +233XXXXXXXXX
- Email must be valid format
- Date of birth must be in the past

## Support
For technical support or questions:
- Email: support@ghanachefsassociation.org

---

Built with React, TypeScript, Tailwind CSS, shadcn/ui, Supabase, and Paystack.
