import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormContext } from '../../contexts/FormContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { TermsModal } from '../TermsModal';
import { termsSchema } from '../../lib/validations';
import { initializePaystack, generatePaymentReference } from '../../lib/paystack';
import { GENDER_LABELS, ID_TYPE_LABELS } from '../../lib/constants';
import { ArrowLeft, Check, CreditCard, AlertCircle, FileText, Shield } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';
import { submitRegistration } from '../../lib/api';

export const ReviewAndPayment = () => {
  const { formData, selectedMembership, setCurrentStep, profilePhotoPreview } = useFormContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [membershipId, setMembershipId] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { toast } = useToast();

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      terms_accepted: false,
      code_of_conduct_accepted: false,
      data_privacy_accepted: false,
    },
  });

  const termsAccepted = watch('terms_accepted');
  const codeAccepted = watch('code_of_conduct_accepted');
  const privacyAccepted = watch('data_privacy_accepted');

  const saveRegistration = async (paymentReference: string) => {
    try {
      const membershipTypeId = formData.membership_type_id ?? selectedMembership?.id;

      if (!membershipTypeId) {
        throw new Error('Please reselect a membership type and try again.');
      }

      const dateOfBirth = formData.date_of_birth
        ? format(formData.date_of_birth, 'yyyy-MM-dd')
        : null;

      const payload = {
        membershipTypeId,
        membershipSlug: formData.membership_slug ?? selectedMembership?.slug,
        personal: {
          firstName: formData.first_name ?? '',
          middleName: formData.middle_name ?? null,
          lastName: formData.last_name ?? '',
          dateOfBirth,
          gender: formData.gender ?? 'male',
          nationality: formData.nationality ?? 'Ghanaian',
        },
        contact: {
          email: formData.email ?? '',
          phone: formData.phone_number ?? '',
          alternativePhone: formData.alternative_phone ?? null,
          streetAddress: formData.street_address ?? '',
          city: formData.city ?? '',
          region: formData.region ?? '',
          digitalAddress: formData.digital_address ?? null,
        },
        identification: {
          idType: formData.id_type ?? 'ghana_card',
          idNumber: formData.id_number ?? '',
        },
        professional: formData.professional_info ?? {},
        emergencyContact: formData.emergency_contact ?? {},
        terms: {
          termsAccepted,
          codeOfConductAccepted: codeAccepted,
          dataPrivacyAccepted: privacyAccepted,
        },
        payment: {
          reference: paymentReference,
          amount: selectedMembership?.price ?? 0,
          status: 'success',
          gateway: 'paystack',
          currency: 'GHS',
          channel: 'web',
          paidAt: new Date().toISOString(),
          metadata: {
            membership_type: selectedMembership?.name ?? '',
            full_name: `${formData.first_name ?? ''} ${formData.last_name ?? ''}`.trim(),
            phone: formData.phone_number ?? '',
          },
        },
      };

      const response = await submitRegistration({
        payload,
        profilePhoto: (formData.profile_photo as File | null) ?? null,
      });

      setMembershipId(response.membershipId);
      setShowSuccess(true);
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const message = error instanceof Error ? error.message : 'Failed to save registration. Please contact support.';
      toast({
        title: 'Registration Failed',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handlePayment = async () => {
    if (!selectedMembership) return;

    setIsProcessing(true);

    const paymentReference = generatePaymentReference();

    try {
      initializePaystack(
        {
          email: formData.email!,
          amount: selectedMembership.price,
          ref: paymentReference,
          currency: 'GHS',
          metadata: {
            membership_type: selectedMembership.name,
            full_name: `${formData.first_name} ${formData.last_name}`,
            phone: formData.phone_number!,
            custom_fields: [
              {
                display_name: 'Membership Type',
                variable_name: 'membership_type',
                value: selectedMembership.name,
              },
            ],
          },
        },
        (reference) => {
          saveRegistration(reference);
          setIsProcessing(false);
        },
        () => {
          setIsProcessing(false);
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment process.',
            variant: 'destructive',
          });
        }
      );
    } catch (error: unknown) {
      setIsProcessing(false);
      const message = error instanceof Error ? error.message : 'Failed to initialize payment.';
      toast({
        title: 'Payment Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  if (showSuccess) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="flex justify-center">
          <div className="bg-teal-100 rounded-full p-6">
            <Check className="h-16 w-16 text-teal-600" />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
          <p className="text-slate-600">Welcome to the Chefs Association of Ghana</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Your Membership Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-700 font-medium">Membership ID:</span>
              <span className="font-bold text-teal-600">{membershipId}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-700 font-medium">Membership Type:</span>
              <span className="font-semibold">{selectedMembership?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-700 font-medium">Valid Until:</span>
              <span className="font-semibold">
                {format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'PPP')}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-700 font-medium">Amount Paid:</span>
              <span className="font-bold">GH₵{selectedMembership?.price.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A confirmation has been recorded in our system. You can now access all membership benefits.
          </AlertDescription>
        </Alert>

        <div className="text-sm text-slate-700 space-y-1">
          <p>For any inquiries, contact us at:</p>
          <p className="font-medium">info@chefsghana.com</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handlePayment)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Badge variant="outline" className="text-teal-600">1</Badge>
              Membership Type
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-900">{selectedMembership?.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{selectedMembership?.description}</p>
                </div>
                <Badge className="bg-teal-600">GH₵{selectedMembership?.price.toFixed(2)}</Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Badge variant="outline" className="text-teal-600">2</Badge>
              Personal Information
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-700 font-medium">Name:</span>
                <p className="font-medium">
                  {formData.first_name} {formData.middle_name} {formData.last_name}
                </p>
              </div>
              <div>
                <span className="text-slate-700 font-medium">Date of Birth:</span>
                <p className="font-medium">{formData.date_of_birth ? format(formData.date_of_birth, 'PPP') : 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-700 font-medium">Gender:</span>
                <p className="font-medium">{GENDER_LABELS[formData.gender!]}</p>
              </div>
              <div>
                <span className="text-slate-700 font-medium">Nationality:</span>
                <p className="font-medium">{formData.nationality}</p>
              </div>
              <div>
                <span className="text-slate-700 font-medium">ID Type:</span>
                <p className="font-medium">{ID_TYPE_LABELS[formData.id_type!]}</p>
              </div>
              <div>
                <span className="text-slate-700 font-medium">ID Number:</span>
                <p className="font-medium">{formData.id_number}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Badge variant="outline" className="text-teal-600">3</Badge>
              Contact Information
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-700 font-medium">Email:</span>
                <p className="font-medium">{formData.email}</p>
              </div>
              <div>
                <span className="text-slate-700 font-medium">Phone:</span>
                <p className="font-medium">{formData.phone_number}</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-700 font-medium">Address:</span>
                <p className="font-medium">
                  {formData.street_address}, {formData.city}, {formData.region}
                </p>
              </div>
            </div>
          </div>

          {profilePhotoPreview && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Badge variant="outline" className="text-teal-600">4</Badge>
                Profile Photo
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg flex justify-center">
                <img src={profilePhotoPreview} alt="Profile" className="h-32 w-32 object-cover rounded-lg" />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
              Edit Information
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setValue('terms_accepted', checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="terms" className="cursor-pointer font-normal">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-teal-600 hover:underline font-medium"
                >
                  Terms and Conditions
                </button>
              </Label>
              {errors.terms_accepted && (
                <p className="text-sm text-red-600 mt-1">{errors.terms_accepted.message}</p>
              )}
            </div>
          </div>

          <TermsModal open={showTermsModal} onOpenChange={setShowTermsModal} />

          <div className="flex items-start space-x-3">
            <Checkbox
              id="code"
              checked={codeAccepted}
              onCheckedChange={(checked) => setValue('code_of_conduct_accepted', checked as boolean)}
            />
            <Label htmlFor="code" className="cursor-pointer font-normal">
              I agree to uphold the professional code of conduct
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={privacyAccepted}
              onCheckedChange={(checked) => setValue('data_privacy_accepted', checked as boolean)}
            />
            <Label htmlFor="privacy" className="cursor-pointer font-normal">
              I consent to the processing of my personal data in accordance with the data privacy policy
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-teal-600" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-slate-700 font-medium">Membership Fee:</span>
            <span className="font-semibold">GH₵{selectedMembership?.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-slate-700 font-medium">Valid Period:</span>
            <span className="font-semibold">1 Year</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-lg font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold text-teal-600">
              GH₵{selectedMembership?.price.toFixed(2)}
            </span>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your payment is secured by Paystack. We accept Mobile Money, Card, and Bank Transfer.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(2)}
          className="px-8"
          disabled={isProcessing}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>

        <Button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white px-8"
          disabled={!termsAccepted || !codeAccepted || !privacyAccepted || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Proceed to Payment
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
