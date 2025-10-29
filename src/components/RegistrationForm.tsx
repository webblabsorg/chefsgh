import { useFormContext } from '../contexts/FormContext';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { MembershipSelection } from './steps/MembershipSelection';
import { PersonalInformation } from './steps/PersonalInformation';
import { ProfessionalInformation } from './steps/ProfessionalInformation';
import { ReviewAndPayment } from './steps/ReviewAndPayment';
import { ChefHat, User, Briefcase, CreditCard } from 'lucide-react';

const steps = [
  { id: 0, name: 'Membership', icon: ChefHat },
  { id: 1, name: 'Personal Info', icon: User },
  { id: 2, name: 'Professional', icon: Briefcase },
  { id: 3, name: 'Review & Pay', icon: CreditCard },
];

export const RegistrationForm = () => {
  const { currentStep } = useFormContext();

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-12 w-12 text-teal-600" />
          </div>
          <h1
            className="text-4xl font-bold text-slate-900 mb-2 tracking-[0.25em]"
            style={{ textTransform: 'uppercase' }}
          >
            Chefs Association of Ghana
          </h1>
          <p className="text-lg text-slate-600">
            Join Ghana's Premier Chef Community
          </p>
        </div>

        <Card className="p-6 mb-6 shadow-lg border-slate-200">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === index;
                const isCompleted = currentStep > index;

                return (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-lg'
                          : isCompleted
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isActive || isCompleted ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="mt-8">
            {currentStep === 0 && <MembershipSelection />}
            {currentStep === 1 && <PersonalInformation />}
            {currentStep === 2 && <ProfessionalInformation />}
            {currentStep === 3 && <ReviewAndPayment />}
          </div>
        </Card>

        <footer className="mt-8 border-t border-slate-200 pt-6">
          <div className="text-center space-y-3">
            <div className="text-sm text-slate-700">
              <p className="font-medium">Need help? Contact us:</p>
              <p className="mt-1">Email: <a href="mailto:info@chefsghana.com" className="text-teal-600 hover:underline">info@chefsghana.com</a></p>
              <p>Phone: <a href="tel:+233244194615" className="text-teal-600 hover:underline">+233 24 419 4615</a></p>
              <p className="mt-1">P.O. Box KN1589, Kaneshie, Accra, Ghana</p>
            </div>
            <div className="text-xs text-slate-500 pt-2">
              <p>&copy; {new Date().getFullYear()} Chefs Association of Ghana. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
