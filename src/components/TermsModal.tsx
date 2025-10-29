import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TermsModal = ({ open, onOpenChange }: TermsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Terms and Conditions</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-120px)] px-6">
          <div className="space-y-6 py-4 text-slate-700">
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">1. Membership Agreement</h3>
              <p className="leading-relaxed">
                By registering as a member of the Chefs Association of Ghana ("the Association"), you agree to be bound by these Terms and Conditions. This agreement becomes effective upon completion of your registration and payment of membership fees.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">2. Membership Eligibility</h3>
              <p className="leading-relaxed mb-2">
                Membership is open to individuals and organizations who meet the following criteria:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Professional chefs with verifiable culinary experience and qualifications</li>
                <li>Students enrolled in accredited culinary or hospitality programs</li>
                <li>Corporate entities operating in the food service industry</li>
                <li>Vendors providing products or services to the culinary industry</li>
                <li>Associates with a genuine interest in culinary arts</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">3. Member Obligations</h3>
              <p className="leading-relaxed mb-2">As a member, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, complete, and truthful information during registration</li>
                <li>Maintain professional conduct at all Association events and activities</li>
                <li>Pay annual membership dues on time and in full</li>
                <li>Respect the intellectual property rights of other members and the Association</li>
                <li>Comply with all Association rules, regulations, and code of conduct</li>
                <li>Update your contact information promptly when changes occur</li>
                <li>Uphold the reputation and values of the culinary profession</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">4. Membership Benefits</h3>
              <p className="leading-relaxed mb-2">
                Members are entitled to benefits as specified for their membership tier, which may include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access to professional development workshops and training programs</li>
                <li>Networking opportunities with industry professionals</li>
                <li>Participation in culinary competitions and events</li>
                <li>Access to member-only resources and publications</li>
                <li>Discounts on Association events and partner services</li>
                <li>Professional certification and recognition programs</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">5. Membership Fees and Renewal</h3>
              <p className="leading-relaxed mb-2">
                Membership fees are non-refundable and valid for one year from the date of payment. Members must renew their membership annually to maintain active status and continue enjoying membership benefits. The Association reserves the right to adjust membership fees with reasonable notice.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">6. Code of Conduct</h3>
              <p className="leading-relaxed mb-2">
                All members must adhere to the Association's professional code of conduct, which includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintaining high standards of culinary excellence and food safety</li>
                <li>Treating colleagues, clients, and the public with respect and dignity</li>
                <li>Avoiding discriminatory practices based on race, gender, religion, or any other protected characteristic</li>
                <li>Refraining from activities that could harm the Association's reputation</li>
                <li>Reporting any violations of ethical standards or professional misconduct</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">7. Data Privacy and Protection</h3>
              <p className="leading-relaxed">
                The Association is committed to protecting your personal information in accordance with Ghana's Data Protection Act, 2012 (Act 843). Your data will be used solely for membership administration, communication, and providing services. We will not share your information with third parties without your explicit consent, except as required by law.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">8. Intellectual Property</h3>
              <p className="leading-relaxed">
                All content, materials, and resources provided by the Association, including but not limited to training materials, publications, and digital content, remain the intellectual property of the Association. Members may not reproduce, distribute, or commercially exploit such materials without written permission.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">9. Suspension and Termination</h3>
              <p className="leading-relaxed mb-2">
                The Association reserves the right to suspend or terminate membership for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violation of these Terms and Conditions</li>
                <li>Breach of the code of conduct</li>
                <li>Non-payment of membership fees</li>
                <li>Conduct detrimental to the Association or its members</li>
                <li>Providing false or misleading information</li>
              </ul>
              <p className="leading-relaxed mt-2">
                Members have the right to appeal any suspension or termination decision within 30 days.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">10. Liability and Indemnification</h3>
              <p className="leading-relaxed">
                The Association shall not be liable for any direct, indirect, incidental, or consequential damages arising from membership or participation in Association activities. Members agree to indemnify and hold harmless the Association, its officers, and representatives from any claims, damages, or expenses arising from their actions or conduct.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">11. Amendments</h3>
              <p className="leading-relaxed">
                The Association reserves the right to amend these Terms and Conditions at any time. Members will be notified of significant changes via email or through the Association's website. Continued membership after notification constitutes acceptance of the amended terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">12. Governing Law</h3>
              <p className="leading-relaxed">
                These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of Ghana. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Ghana.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">13. Contact Information</h3>
              <p className="leading-relaxed">
                For questions or concerns regarding these Terms and Conditions, please contact:
              </p>
              <div className="mt-3 pl-4 border-l-4 border-teal-600 bg-slate-50 p-4 rounded">
                <p className="font-medium">Chefs Association of Ghana</p>
                <p>Email: info@chefsghana.com</p>
                <p>Phone: +233 24 493 5185 / +233 24 277 7111</p>
                <p>Website: www.chefsghana.com</p>
              </div>
            </section>

            <section className="pt-4 border-t">
              <p className="text-sm text-slate-600 italic">
                Last Updated: October 2024
              </p>
              <p className="text-sm text-slate-600 mt-2">
                By clicking "I agree" and proceeding with registration, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
