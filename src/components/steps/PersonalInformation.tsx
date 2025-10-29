import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormContext } from '../../contexts/FormContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { personalInfoSchema, contactInfoSchema } from '../../lib/validations';
import { GHANA_REGIONS, ID_TYPE_LABELS, GENDER_LABELS } from '../../lib/constants';
import { ArrowLeft, ArrowRight, CalendarIcon, User, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

const combinedSchema = personalInfoSchema.merge(contactInfoSchema);
type FormData = z.infer<typeof combinedSchema>;

export const PersonalInformation = () => {
  const { formData, updateFormData, setCurrentStep } = useFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      first_name: formData.first_name || '',
      middle_name: formData.middle_name || '',
      last_name: formData.last_name || '',
      date_of_birth: formData.date_of_birth || undefined,
      gender: formData.gender || 'male',
      nationality: formData.nationality || 'Ghanaian',
      id_type: formData.id_type || 'ghana_card',
      id_number: formData.id_number || '',
      email: formData.email || '',
      phone_number: formData.phone_number || '+233',
      alternative_phone: formData.alternative_phone || '',
      street_address: formData.street_address || '',
      city: formData.city || '',
      region: formData.region || '',
      digital_address: formData.digital_address || '',
    },
  });

  const dateOfBirth = watch('date_of_birth');
  const gender = watch('gender');
  const idType = watch('id_type');
  const region = watch('region');

  const onSubmit = (data: FormData) => {
    updateFormData(data);
    setCurrentStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-teal-600" />
            <CardTitle>Personal Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" {...register('first_name')} />
              {errors.first_name && (
                <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input id="middle_name" {...register('middle_name')} />
            </div>

            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" {...register('last_name')} />
              {errors.last_name && (
                <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date of Birth *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateOfBirth && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={(date) => setValue('date_of_birth', date as Date)}
                    initialFocus
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    yearRange={{ from: 1940, to: new Date().getFullYear() }}
                  />
                </PopoverContent>
              </Popover>
              {errors.date_of_birth && (
                <p className="text-sm text-red-600 mt-1">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div>
              <Label>Gender *</Label>
              <RadioGroup value={gender} onValueChange={(value) => setValue('gender', value as any)}>
                <div className="flex gap-4 mt-2">
                  {Object.entries(GENDER_LABELS).map(([value, label]) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={value} />
                      <Label htmlFor={value} className="font-normal cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              {errors.gender && (
                <p className="text-sm text-red-600 mt-1">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nationality">Nationality *</Label>
              <Input id="nationality" {...register('nationality')} />
              {errors.nationality && (
                <p className="text-sm text-red-600 mt-1">{errors.nationality.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="id_type">ID Type *</Label>
              <Select value={idType} onValueChange={(value) => setValue('id_type', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ID_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.id_type && (
                <p className="text-sm text-red-600 mt-1">{errors.id_type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="id_number">ID Number *</Label>
              <Input id="id_number" {...register('id_number')} />
              {errors.id_number && (
                <p className="text-sm text-red-600 mt-1">{errors.id_number.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-teal-600" />
            <CardTitle>Contact Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input id="phone_number" {...register('phone_number')} placeholder="+233XXXXXXXXX" />
              {errors.phone_number && (
                <p className="text-sm text-red-600 mt-1">{errors.phone_number.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="alternative_phone">Alternative Phone</Label>
            <Input id="alternative_phone" {...register('alternative_phone')} placeholder="+233XXXXXXXXX" />
            {errors.alternative_phone && (
              <p className="text-sm text-red-600 mt-1">{errors.alternative_phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="street_address">Street Address *</Label>
            <Input id="street_address" {...register('street_address')} />
            {errors.street_address && (
              <p className="text-sm text-red-600 mt-1">{errors.street_address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City/Town *</Label>
              <Input id="city" {...register('city')} />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="region">Region *</Label>
              <Select value={region} onValueChange={(value) => setValue('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {GHANA_REGIONS.map((regionName) => (
                    <SelectItem key={regionName} value={regionName}>
                      {regionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region && (
                <p className="text-sm text-red-600 mt-1">{errors.region.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="digital_address">Digital Address (GPS)</Label>
              <Input id="digital_address" {...register('digital_address')} placeholder="GH-XXX-XXXX" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(0)}
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
