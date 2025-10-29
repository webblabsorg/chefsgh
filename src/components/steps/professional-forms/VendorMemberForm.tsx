import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormContext } from '../../../contexts/FormContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { FileUpload } from '../../FileUpload';
import { vendorMemberSchema, emergencyContactSchema } from '../../../lib/validations';
import { MAX_FILE_SIZES, ACCEPTED_IMAGE_TYPES } from '../../../lib/constants';
import { ArrowLeft, ArrowRight, Package, AlertCircle, Camera } from 'lucide-react';

const combinedSchema = vendorMemberSchema.merge(emergencyContactSchema);
type FormData = z.infer<typeof combinedSchema>;

export const VendorMemberForm = () => {
  const { formData, updateFormData, setCurrentStep, profilePhotoPreview, setProfilePhotoPreview } = useFormContext();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(formData.profile_photo || null);

  const vendorInfo = formData.professional_info as any;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      company_name: vendorInfo?.company_name || '',
      products_services: vendorInfo?.products_services || '',
      registration_number: vendorInfo?.registration_number || '',
      years_in_business: vendorInfo?.years_in_business || '',
      primary_contact: vendorInfo?.primary_contact || '',
      business_website: vendorInfo?.business_website || '',
      emergency_contact: formData.emergency_contact || { name: '', relationship: '', phone: '' },
    },
  });

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
        company_name: data.company_name,
        products_services: data.products_services,
        registration_number: data.registration_number,
        years_in_business: data.years_in_business,
        primary_contact: data.primary_contact,
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
            <Package className="h-5 w-5 text-teal-600" />
            <CardTitle>Vendor Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input id="company_name" {...register('company_name')} placeholder="Your company/vendor name" />
              {errors.company_name && (
                <p className="text-sm text-red-600 mt-1">{errors.company_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="registration_number">Registration Number *</Label>
              <Input id="registration_number" {...register('registration_number')} placeholder="Business registration number" />
              {errors.registration_number && (
                <p className="text-sm text-red-600 mt-1">{errors.registration_number.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="products_services">Products/Services Offered * (min 10 characters)</Label>
            <Textarea
              id="products_services"
              {...register('products_services')}
              rows={3}
              placeholder="Describe the products and services you offer to the culinary industry..."
            />
            {errors.products_services && (
              <p className="text-sm text-red-600 mt-1">{errors.products_services.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="years_in_business">Years in Business *</Label>
              <Input id="years_in_business" type="number" {...register('years_in_business')} placeholder="Years operating" min="0" />
              {errors.years_in_business && (
                <p className="text-sm text-red-600 mt-1">{errors.years_in_business.message}</p>
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
            <Label htmlFor="primary_contact">Primary Contact Person *</Label>
            <Input id="primary_contact" {...register('primary_contact')} placeholder="Name of main contact person" />
            {errors.primary_contact && (
              <p className="text-sm text-red-600 mt-1">{errors.primary_contact.message}</p>
            )}
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
            <CardTitle>Company Logo / Photo</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <FileUpload
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            maxSize={MAX_FILE_SIZES.profile_photo}
            onFileSelect={handleProfilePhotoSelect}
            currentFile={profilePhoto}
            preview={profilePhotoPreview}
            label="Upload company logo or representative photo *"
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
