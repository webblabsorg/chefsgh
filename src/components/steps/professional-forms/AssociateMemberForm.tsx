import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormContext } from '../../../contexts/FormContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { FileUpload } from '../../FileUpload';
import { associateMemberSchema, emergencyContactSchema } from '../../../lib/validations';
import { ASSOCIATE_INTERESTS, MAX_FILE_SIZES, ACCEPTED_IMAGE_TYPES } from '../../../lib/constants';
import { ArrowLeft, ArrowRight, Users, AlertCircle, Camera } from 'lucide-react';

const combinedSchema = associateMemberSchema.merge(emergencyContactSchema);
type FormData = z.infer<typeof combinedSchema>;

export const AssociateMemberForm = () => {
  const { formData, updateFormData, setCurrentStep, profilePhotoPreview, setProfilePhotoPreview } = useFormContext();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(formData.profile_photo || null);

  const associateInfo = formData.professional_info as any;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      occupation: associateInfo?.occupation || '',
      areas_of_interest: associateInfo?.areas_of_interest || [],
      reason_for_joining: associateInfo?.reason_for_joining || '',
      emergency_contact: formData.emergency_contact || { name: '', relationship: '', phone: '' },
    },
  });

  const selectedInterests = watch('areas_of_interest') || [];

  const handleInterestToggle = (interest: string) => {
    const current = selectedInterests;
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    setValue('areas_of_interest', updated);
  };

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
        occupation: data.occupation,
        areas_of_interest: data.areas_of_interest,
        reason_for_joining: data.reason_for_joining,
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
            <Users className="h-5 w-5 text-teal-600" />
            <CardTitle>Associate Member Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="occupation">Occupation/Profession *</Label>
            <Input id="occupation" {...register('occupation')} placeholder="e.g., Food Blogger, Nutritionist, Food Photographer, Culinary Educator" />
            {errors.occupation && (
              <p className="text-sm text-red-600 mt-1">{errors.occupation.message}</p>
            )}
          </div>

          <div>
            <Label>Areas of Interest in Culinary Arts * (Select at least one)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {ASSOCIATE_INTERESTS.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest}
                    checked={selectedInterests.includes(interest)}
                    onCheckedChange={() => handleInterestToggle(interest)}
                  />
                  <Label htmlFor={interest} className="font-normal cursor-pointer">
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
            {errors.areas_of_interest && (
              <p className="text-sm text-red-600 mt-1">{errors.areas_of_interest.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reason_for_joining">Reason for Joining * (min 20 characters)</Label>
            <Textarea
              id="reason_for_joining"
              {...register('reason_for_joining')}
              rows={4}
              placeholder="Tell us why you want to join the Chefs Association of Ghana..."
            />
            {errors.reason_for_joining && (
              <p className="text-sm text-red-600 mt-1">{errors.reason_for_joining.message}</p>
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
            <CardTitle>Profile Photo</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <FileUpload
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            maxSize={MAX_FILE_SIZES.profile_photo}
            onFileSelect={handleProfilePhotoSelect}
            currentFile={profilePhoto}
            preview={profilePhotoPreview}
            label="Upload passport-style photo *"
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
