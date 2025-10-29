import { useFormContext } from '../../contexts/FormContext';
import { ProfessionalMemberForm } from './professional-forms/ProfessionalMemberForm';
import { CorporateMemberForm } from './professional-forms/CorporateMemberForm';
import { AssociateMemberForm } from './professional-forms/AssociateMemberForm';
import { VendorMemberForm } from './professional-forms/VendorMemberForm';
import { StudentMemberForm } from './professional-forms/StudentMemberForm';

export const ProfessionalInformation = () => {
  const { selectedMembership } = useFormContext();

  if (!selectedMembership) {
    return null;
  }

  const formComponents = {
    professional: ProfessionalMemberForm,
    corporate: CorporateMemberForm,
    associate: AssociateMemberForm,
    vendor: VendorMemberForm,
    student: StudentMemberForm,
  };

  const FormComponent = formComponents[selectedMembership.slug as keyof typeof formComponents];

  return <FormComponent />;
};
