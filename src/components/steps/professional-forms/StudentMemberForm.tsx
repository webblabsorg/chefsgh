import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormContext } from '../../../contexts/FormContext';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { FileUpload } from '../../FileUpload';
import { studentMemberSchema, emergencyContactSchema } from '../../../lib/validations';
import { MAX_FILE_SIZES, ACCEPTED_IMAGE_TYPES } from '../../../lib/constants';
import { ArrowLeft, ArrowRight, GraduationCap, AlertCircle, Camera, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';

const combinedSchema = studentMemberSchema.merge(emergencyContactSchema);
type FormData = z.infer<typeof combinedSchema>;

export const StudentMemberForm = () => {
  const { formData, updateFormData, setCurrentStep, profilePhotoPreview, setProfilePhotoPreview } = useFormContext();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(formData.profile_photo || null);
  const [studentIdCard, setStudentIdCard] = useState<File | null>(null);

  const studentInfo = formData.professional_info as any;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      institution_name: studentInfo?.institution_name || '',
      program: studentInfo?.program || '',
      expected_graduation: studentInfo?.expected_graduation || '',
      student_id_number: studentInfo?.student_id_number || '',
      emergency_contact: formData.emergency_contact || { name: '', relationship: '', phone: '' },
    },
  });

  const expectedGraduation = watch('expected_graduation');

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

    if (!studentIdCard) {
      alert('Student ID card is required');
      return;
    }

    updateFormData({
      professional_info: {
        institution_name: data.institution_name,
        program: data.program,
        expected_graduation: data.expected_graduation,
        student_id_number: data.student_id_number,
      },
      emergency_contact: data.emergency_contact,
      profile_photo: profilePhoto,
      documents: [studentIdCard],
    });
    setCurrentStep(3);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-teal-600" />
            <CardTitle>Student Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="institution_name">Institution Name *</Label>
            <Input id="institution_name" {...register('institution_name')} placeholder="e.g., University of Ghana, KNUST, Hospitality Training Institute" />
            {errors.institution_name && (
              <p className="text-sm text-red-600 mt-1">{errors.institution_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="program">Program/Course of Study *</Label>
              <Input id="program" {...register('program')} placeholder="e.g., Culinary Arts, Hotel Management, Food Science" />
              {errors.program && (
                <p className="text-sm text-red-600 mt-1">{errors.program.message}</p>
              )}
            </div>

            <div>
              <Label>Expected Graduation Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !expectedGraduation && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expectedGraduation ? format(new Date(expectedGraduation), 'MMMM yyyy') : 'Select graduation date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expectedGraduation ? new Date(expectedGraduation) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setValue('expected_graduation', format(date, 'yyyy-MM'));
                      }
                    }}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 10 }}
                  />
                </PopoverContent>
              </Popover>
              {errors.expected_graduation && (
                <p className="text-sm text-red-600 mt-1">{errors.expected_graduation.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="student_id_number">Student ID Number *</Label>
            <Input id="student_id_number" {...register('student_id_number')} placeholder="Your institution's student ID" />
            {errors.student_id_number && (
              <p className="text-sm text-red-600 mt-1">{errors.student_id_number.message}</p>
            )}
          </div>

          <FileUpload
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            maxSize={MAX_FILE_SIZES.student_id}
            onFileSelect={setStudentIdCard}
            currentFile={studentIdCard}
            label="Upload Student ID Card * (photo of your student ID)"
          />
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
