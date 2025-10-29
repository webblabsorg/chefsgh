import { MembershipType } from '../types/registration';

export const defaultMemberships: MembershipType[] = [
  {
    id: 'fallback-professional',
    name: 'Professional Membership',
    slug: 'professional',
    price: 200,
    description:
      'For qualified chefs with formal culinary training and professional kitchen experience. Ideal for executive chefs, sous chefs, and culinary professionals actively working in the industry.',
    benefits: [
      'Access to exclusive chef networking events',
      'Professional development workshops',
      'Industry recognition and credibility',
      'Quarterly culinary magazine subscription',
      'Job placement assistance',
      'Voting rights in association matters',
    ],
    is_active: true,
  },
  {
    id: 'fallback-corporate',
    name: 'Corporate Membership',
    slug: 'corporate',
    price: 5000,
    description:
      'Designed for culinary businesses, restaurants, hotels, catering companies, and food service establishments seeking institutional representation and networking opportunities.',
    benefits: [
      'Business listing in association directory',
      'Brand visibility at chef events',
      'Staff training discounts',
      'Industry insights and market reports',
      'B2B networking opportunities',
      'Participation in food expos and trade shows',
    ],
    is_active: true,
  },
  {
    id: 'fallback-associate',
    name: 'Associate Membership',
    slug: 'associate',
    price: 500,
    description:
      'For culinary enthusiasts, food bloggers, culinary instructors, and individuals passionate about the culinary arts who may not be actively working in professional kitchens.',
    benefits: [
      'Access to culinary workshops',
      'Networking with professional chefs',
      'Recipe sharing platform',
      'Discounts on culinary events',
      'Monthly newsletter',
      'Community forum access',
    ],
    is_active: true,
  },
  {
    id: 'fallback-vendor',
    name: 'Vendor Membership',
    slug: 'vendor',
    price: 1000,
    description:
      'For suppliers, food distributors, equipment vendors, and service providers who support the culinary industry and want to build B2B relationships.',
    benefits: [
      'Vendor directory listing',
      'Direct access to chef network',
      'Product showcase opportunities',
      'Industry event participation',
      'Market intelligence reports',
      'Promotional opportunities',
    ],
    is_active: true,
  },
  {
    id: 'fallback-student',
    name: 'Student Membership',
    slug: 'student',
    price: 120,
    description:
      'Discounted membership for culinary students enrolled in accredited culinary schools, hospitality programs, or food-related academic courses.',
    benefits: [
      'Mentorship program access',
      'Student chef competitions',
      'Internship opportunities',
      'Career guidance sessions',
      'Discounted event tickets',
      'Learning resources and tutorials',
    ],
    is_active: true,
  },
];
