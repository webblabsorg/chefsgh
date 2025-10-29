import { createContext, useContext, useState, ReactNode } from 'react';
import { RegistrationFormData, MembershipType } from '../types/registration';

interface FormContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: Partial<RegistrationFormData>;
  updateFormData: (data: Partial<RegistrationFormData>) => void;
  selectedMembership: MembershipType | null;
  setSelectedMembership: (membership: MembershipType | null) => void;
  profilePhotoPreview: string | null;
  setProfilePhotoPreview: (preview: string | null) => void;
  resetForm: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const initialFormData: Partial<RegistrationFormData> = {
  gender: 'male',
  id_type: 'ghana_card',
  nationality: 'Ghanaian',
  professional_info: {},
  emergency_contact: {
    name: '',
    relationship: '',
    phone: '',
  },
  terms_accepted: false,
  code_of_conduct_accepted: false,
  data_privacy_accepted: false,
};

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>(initialFormData);
  const [selectedMembership, setSelectedMembership] = useState<MembershipType | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  const updateFormData = (data: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedMembership(null);
    setProfilePhotoPreview(null);
    setCurrentStep(0);
  };

  return (
    <FormContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        formData,
        updateFormData,
        selectedMembership,
        setSelectedMembership,
        profilePhotoPreview,
        setProfilePhotoPreview,
        resetForm,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context;
};
