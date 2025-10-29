import { useState, useEffect, useCallback } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { MembershipType, MembershipSlug } from '../../types/registration';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Check, ChefHat, Building2, Users, Package, GraduationCap, ArrowRight } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { defaultMemberships } from '../../lib/default-memberships';
import { fetchMembershipTypes } from '../../lib/api';

const membershipIcons: Record<MembershipSlug, typeof ChefHat> = {
  professional: ChefHat,
  corporate: Building2,
  associate: Users,
  vendor: Package,
  student: GraduationCap,
};
const knownSlugs: MembershipSlug[] = ['professional', 'corporate', 'associate', 'vendor', 'student'];

const isMembershipSlug = (value: unknown): value is MembershipSlug =>
  typeof value === 'string' && (knownSlugs as string[]).includes(value);

const normalizeMemberships = (items: Partial<MembershipType>[]): MembershipType[] =>
  items
    .map((item) => {
      if (!isMembershipSlug(item.slug)) {
        return null;
      }

      const benefitsSource = item.benefits;
      let benefits: string[] = [];

      if (Array.isArray(benefitsSource)) {
        benefits = benefitsSource.filter((benefit): benefit is string => typeof benefit === 'string');
      } else if (typeof benefitsSource === 'string') {
        try {
          const parsed = JSON.parse(benefitsSource);
          if (Array.isArray(parsed)) {
            benefits = parsed.filter((benefit): benefit is string => typeof benefit === 'string');
          }
        } catch (err: unknown) {
          console.warn('Failed to parse membership benefits', err);
        }
      }

      const priceValue =
        typeof item.price === 'number'
          ? item.price
          : typeof item.price === 'string'
            ? parseFloat(item.price)
            : Number(item.price ?? 0);

      const membership: MembershipType = {
        id: item.id ?? '',
        name: item.name ?? '',
        slug: item.slug,
        benefits,
        price: Number.isFinite(priceValue) ? priceValue : 0,
        description: item.description ?? '',
        is_active: item.is_active ?? true,
      };

      return membership;
    })
    .filter((membership): membership is MembershipType => Boolean(membership && membership.is_active && membership.id));

export const MembershipSelection = () => {
  const [memberships, setMemberships] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(true);
  const { updateFormData, setSelectedMembership, selectedMembership, setCurrentStep } = useFormContext();
  const { toast } = useToast();

  const applyFallbackMemberships = useCallback(() => {
    setMemberships(defaultMemberships);
  }, []);

  const fetchMemberships = useCallback(async () => {
    try {
      const data = await fetchMembershipTypes();

      if (!data || data.length === 0) {
        applyFallbackMemberships();
        return;
      }

      setMemberships(normalizeMemberships(data as Partial<MembershipType>[]));
    } catch (error: unknown) {
      console.error('Failed to load membership types', error);
      applyFallbackMemberships();
    } finally {
      setLoading(false);
    }
  }, [applyFallbackMemberships]);

  useEffect(() => {
    void fetchMemberships();
  }, [fetchMemberships]);

  const handleSelectMembership = (membership: MembershipType) => {
    setSelectedMembership(membership);
    updateFormData({
      membership_type_id: membership.id,
      membership_slug: membership.slug,
    });
  };

  const handleContinue = () => {
    if (!selectedMembership) {
      toast({
        title: 'Selection Required',
        description: 'Please select a membership type to continue.',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Membership</h2>
        <p className="text-slate-600">Select the membership type that best fits your profile</p>
      </div>

      {/* Connectivity notice removed for production UX. */}

      <div className="grid gap-6 md:grid-cols-2">
        {memberships.map((membership) => {
          const Icon = membershipIcons[membership.slug] ?? ChefHat;
          const isSelected = selectedMembership?.id === membership.id;

          return (
            <Card
              key={membership.id}
              className={`relative cursor-pointer transition-all hover:shadow-xl ${
                isSelected
                  ? 'border-teal-600 border-2 shadow-lg bg-teal-50/50'
                  : 'border-slate-200 hover:border-teal-300'
              }`}
              onClick={() => handleSelectMembership(membership)}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3 bg-teal-600 text-white rounded-full p-2 shadow-lg">
                  <Check className="h-5 w-5" />
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-3 rounded-lg ${isSelected ? 'bg-teal-600' : 'bg-slate-100'}`}>
                    <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-slate-700'}`} />
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold">
                    GH₵{membership.price.toFixed(2)}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{membership.name}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {membership.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Key Benefits:</p>
                  <ul className="space-y-2">
                    {membership.benefits.slice(0, 4).map((benefit, index) => (
                      <li key={index} className="flex items-start text-sm text-slate-600">
                        <Check className="h-4 w-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={handleContinue}
          size="lg"
          className="bg-teal-600 hover:bg-teal-700 text-white px-8"
          disabled={!selectedMembership}
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
