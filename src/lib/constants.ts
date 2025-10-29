export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Brong-Ahafo',
  'Savannah',
  'Bono East',
  'Ahafo',
  'Oti',
  'North East',
  'Western North',
];

export const CULINARY_SPECIALIZATIONS = [
  'Pastry & Baking',
  'Continental Cuisine',
  'Local/Traditional Cuisine',
  'Fusion Cuisine',
  'Asian Cuisine',
  'Mediterranean Cuisine',
  'Grilling & BBQ',
  'Molecular Gastronomy',
  'Vegan/Vegetarian',
  'Catering & Events',
];

export const BUSINESS_TYPES = [
  'Restaurant',
  'Hotel',
  'Catering Service',
  'Food Service',
  'Bakery',
  'Fast Food',
  'Fine Dining',
  'Cafe/Coffee Shop',
  'Cloud Kitchen',
  'Other',
];

export const ASSOCIATE_INTERESTS = [
  'Food Writing & Blogging',
  'Culinary Education',
  'Food Photography',
  'Recipe Development',
  'Food Styling',
  'Culinary History',
  'Nutrition & Dietetics',
  'Food Business',
];

export const ID_TYPE_LABELS: Record<string, string> = {
  ghana_card: 'Ghana Card',
  passport: 'Passport',
  voter_id: 'Voter ID',
  driver_license: "Driver's License",
};

export const GENDER_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  prefer_not_to_say: 'Prefer not to say',
};

export const MAX_FILE_SIZES = {
  profile_photo: 2 * 1024 * 1024,
  certificate: 5 * 1024 * 1024,
  student_id: 3 * 1024 * 1024,
  business_logo: 2 * 1024 * 1024,
};

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export const ACCEPTED_DOCUMENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];
