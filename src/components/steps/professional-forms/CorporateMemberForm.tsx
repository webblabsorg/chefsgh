import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormContext } from '../../../contexts/FormContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { FileUpload } from '../../FileUpload';
import { corporateMemberSchema, emergencyContactSchema } from '../../../lib/validations';
import { BUSINESS_TYPES, MAX_FILE_SIZES, ACCEPTED_IMAGE_TYPES } from '../../../lib/constants';
import { ArrowLeft, ArrowRight, Building2, AlertCircle, Camera } from 'lucide-react';

const combinedSchema = corporateMemberSchema.merge(emergencyContactSchema);
type FormData = z.infer<typeof combinedSchema>;

export const CorporateMemberForm = () => {
  const { formData, updateFormData, setCurrentStep, profilePhotoPreview, setProfilePhotoPreview } = useFormContext();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(formData.profile_photo || null);

  const corporateInfo = formData.professional_info as any;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      business_name: corporateInfo?.business_name || '',
      business_type: corporateInfo?.business_type || '',
      registration_number: corporateInfo?.registration_number || '',
      number_of_employees: corporateInfo?.number_of_employees || '',
      years_in_operation: corporateInfo?.years_in_operation || '',
      business_address: corporateInfo?.business_address || '',
      contact_person_name: corporateInfo?.contact_person_name || '',
      contact_person_position: corporateInfo?.contact_person_position || '',
      business_website: corporateInfo?.business_website || '',
      emergency_contact: formData.emergency_contact || { name: '', relationship: '', phone: '' },
    },
  });

  const businessType = watch('business_type');

  const handleProfilePhotoSelect = (file: File | null) => {
    setProfilePhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePhotoPreview(null);
    }
  };

  const onSubmit = (data: FormData) => {
    if (!profilePhoto) {
      alert('Profile photo is required');
      return;
    }

    updateFormData({
      professional_info: {
        business_name: data.business_name,
        business_type: data.business_type,
        registration_number: data.registration_number,
        number_of_employees: data.number_of_employees,
        years_in_operation: data.years_in_operation,
        business_address: data.business_address,
        contact_person_name: data.contact_person_name,
        contact_person_position: data.contact_person_position,
        business_website: data.business_website,
      },
      emergency_contact: data.emergency_contact,
      profile_photo: profilePhoto,
    });
    setCurrentStep(3);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-600" />
            <CardTitle>Business Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_name">Business Name *</Label>
              <Input id="business_name" {...register('business_name')} placeholder="e.g., Your Restaurant/Hotel Name" />
              {errors.business_name && (
                <p className="text-sm text-red-600 mt-1">{errors.business_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="business_type">Business Type *</Label>
              <Select value={businessType} onValueChange={(value) => setValue('business_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.business_type && (
                <p className="text-sm text-red-600 mt-1">{errors.business_type.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registration_number">Business Registration Number *</Label>
              <Input id="registration_number" {...register('registration_number')} placeholder="Company registration number" />
              {errors.registration_number && (
                <p className="text-sm text-red-600 mt-1">{errors.registration_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="number_of_employees">Number of Employees *</Label>
              <Input id="number_of_employees" type="number" {...register('number_of_employees')} placeholder="Total staff count" min="1" />
              {errors.number_of_employees && (
                <p className="text-sm text-red-600 mt-1">{errors.number_of_employees.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="years_in_operation">Years in Operation *</Label>
              <Input id="years_in_operation" type="number" {...register('years_in_operation')} placeholder="Years in business" min="0" />
              {errors.years_in_operation && (
                <p className="text-sm text-red-600 mt-1">{errors.years_in_operation.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="business_website">Business Website</Label>
              <Input id="business_website" type="url" {...register('business_website')} placeholder="https://" />
              {errors.business_website && (
                <p className="text-sm text-red-600 mt-1">{errors.business_website.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="business_address">Business Address *</Label>
            <Input id="business_address" {...register('business_address')} placeholder="Physical location of your business" />
            {errors.business_address && (
              <p className="text-sm text-red-600 mt-1">{errors.business_address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_person_name">Contact Person Name *</Label>
              <Input id="contact_person_name" {...register('contact_person_name')} placeholder="Primary contact person" />
              {errors.contact_person_name && (
                <p className="text-sm text-red-600 mt-1">{errors.contact_person_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contact_person_position">Contact Person Position *</Label>
              <Input id="contact_person_position" {...register('contact_person_position')} placeholder="e.g., General Manager, Owner, Director" />
              {errors.contact_person_position && (
                <p className="text-sm text-red-600 mt-1">{errors.contact_person_position.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-teal-600" />
            <CardTitle>Emergency Contact</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="emergency_contact.name">Name *</Label>
              <Input id="emergency_contact.name" {...register('emergency_contact.name')} />
              {errors.emergency_contact?.name && (
                <p className="text-sm text-red-600 mt-1">{errors.emergency_contact.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="emergency_contact.relationship">Relationship *</Label>
              <Input id="emergency_contact.relationship" {...register('emergency_contact.relationship')} />
              {errors.emergency_contact?.relationship && (
                <p className="text-sm text-red-600 mt-1">{errors.emergency_contact.relationship.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="emergency_contact.phone">Phone Number *</Label>
              <Input
                id="emergency_contact.phone"
                {...register('emergency_contact.phone')}
                placeholder="+233XXXXXXXXX"
              />
              {errors.emergency_contact?.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.emergency_contact.phone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-teal-600" />
            <CardTitle>Business Logo / Representative Photo</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <FileUpload
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            maxSize={MAX_FILE_SIZES.profile_photo}
            onFileSelect={handleProfilePhotoSelect}
            currentFile={profilePhoto}
            preview={profilePhotoPreview}
            label="Upload business logo or representative photo *"
          />
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
          className="px-8"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>

        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-8">
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};
