import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormContext } from '../../../contexts/FormContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import { FileUpload } from '../../FileUpload';
import { professionalMemberSchema, emergencyContactSchema } from '../../../lib/validations';
import { CULINARY_SPECIALIZATIONS, MAX_FILE_SIZES, ACCEPTED_IMAGE_TYPES } from '../../../lib/constants';
import { ArrowLeft, ArrowRight, Plus, X, Briefcase, AlertCircle, Camera } from 'lucide-react';

const combinedSchema = professionalMemberSchema.merge(emergencyContactSchema);
type FormData = z.infer<typeof combinedSchema>;

export const ProfessionalMemberForm = () => {
  const { formData, updateFormData, setCurrentStep, profilePhotoPreview, setProfilePhotoPreview } = useFormContext();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(formData.profile_photo || null);

  const professionalInfo = formData.professional_info as any;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      current_position: professionalInfo?.current_position || '',
      current_employer: professionalInfo?.current_employer || '',
      years_of_experience: professionalInfo?.years_of_experience || '',
      culinary_specialization: professionalInfo?.culinary_specialization || [],
      qualifications: professionalInfo?.qualifications || [{ institution: '', certificate: '', year: '' }],
      emergency_contact: formData.emergency_contact || { name: '', relationship: '', phone: '' },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'qualifications',
  });

  const selectedSpecializations = watch('culinary_specialization') || [];

  const handleSpecializationToggle = (specialization: string) => {
    const current = selectedSpecializations;
    const updated = current.includes(specialization)
      ? current.filter((s) => s !== specialization)
      : [...current, specialization];
    setValue('culinary_specialization', updated);
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
        current_position: data.current_position,
        current_employer: data.current_employer,
        years_of_experience: data.years_of_experience,
        culinary_specialization: data.culinary_specialization,
        qualifications: data.qualifications,
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
            <Briefcase className="h-5 w-5 text-teal-600" />
            <CardTitle>Professional Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current_position">Current Position/Title *</Label>
              <Input id="current_position" {...register('current_position')} placeholder="e.g., Executive Chef, Sous Chef, Pastry Chef" />
              {errors.current_position && (
                <p className="text-sm text-red-600 mt-1">{errors.current_position.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="current_employer">Current Employer *</Label>
              <Input id="current_employer" {...register('current_employer')} placeholder="e.g., Restaurant name, Hotel name" />
              {errors.current_employer && (
                <p className="text-sm text-red-600 mt-1">{errors.current_employer.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="years_of_experience">Years of Professional Culinary Experience *</Label>
            <Input id="years_of_experience" type="number" {...register('years_of_experience')} placeholder="e.g., 5" min="0" />
            {errors.years_of_experience && (
              <p className="text-sm text-red-600 mt-1">{errors.years_of_experience.message}</p>
            )}
          </div>

          <div>
            <Label>Culinary Specialization * (Select at least one)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {CULINARY_SPECIALIZATIONS.map((spec) => (
                <div key={spec} className="flex items-center space-x-2">
                  <Checkbox
                    id={spec}
                    checked={selectedSpecializations.includes(spec)}
                    onCheckedChange={() => handleSpecializationToggle(spec)}
                  />
                  <Label htmlFor={spec} className="font-normal cursor-pointer">
                    {spec}
                  </Label>
                </div>
              ))}
            </div>
            {errors.culinary_specialization && (
              <p className="text-sm text-red-600 mt-1">{errors.culinary_specialization.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Culinary Qualifications *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ institution: '', certificate: '', year: '' })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Qualification
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="bg-slate-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label htmlFor={`qualifications.${index}.institution`}>Institution</Label>
                          <Input {...register(`qualifications.${index}.institution` as const)} placeholder="e.g., Culinary Institute, Hotel School" />
                          {errors.qualifications?.[index]?.institution && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.qualifications[index]?.institution?.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`qualifications.${index}.certificate`}>Certificate/Degree</Label>
                            <Input {...register(`qualifications.${index}.certificate` as const)} placeholder="e.g., Diploma in Culinary Arts" />
                            {errors.qualifications?.[index]?.certificate && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors.qualifications[index]?.certificate?.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`qualifications.${index}.year`}>Year</Label>
                            <Input {...register(`qualifications.${index}.year` as const)} placeholder="YYYY" />
                            {errors.qualifications?.[index]?.year && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors.qualifications[index]?.year?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
