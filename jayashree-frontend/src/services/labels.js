/** Display names for the values the API uses. */

export const PROJECT_CATEGORIES = {
  RESIDENTIAL: 'Residential Home',
  BUNGALOW: 'Bungalow',
  VILLA: 'Villa',
  COMMERCIAL: 'Commercial',
  OTHER: 'Other',
};

export const PROJECT_STATUS = { ONGOING: 'Ongoing', COMPLETED: 'Completed' };

export const GALLERY_CATEGORIES = {
  EXTERIOR: 'Exterior',
  INTERIOR: 'Interior',
  BUNGALOW: 'Bungalows',
  RESIDENTIAL: 'Residential Projects',
  ONGOING: 'Ongoing Projects',
  COMPLETED: 'Completed Projects',
};

export const REVIEW_STATUS = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected' };

export const ENQUIRY_STATUS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  FOLLOW_UP: 'Follow-up',
  CONVERTED: 'Converted',
  CLOSED: 'Closed',
};

export const ENQUIRY_TYPES = { CONTACT: 'Contact form', QUOTE: 'Quote request', PROJECT: 'Project enquiry' };

export const CONSTRUCTION_TYPES = ['Residential House', 'Bungalow', 'Villa', 'Commercial Construction', 'Other'];

export const INTERESTED_IN = [
  'Residential Construction',
  'Bungalow Construction',
  'Villa Development',
  'Project Development',
  'Construction Services',
  'Architectural Planning',
  'Land Development',
  'Buying in a Project',
  'Other',
];

export const BUDGETS = ['Under ₹25 Lakh', '₹25 – 50 Lakh', '₹50 Lakh – 1 Crore', '₹1 – 2 Crore', 'Above ₹2 Crore', 'Not sure yet'];

export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  const date = typeof value === 'string' && value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-IN', options);
}

export function formatDateTime(value) {
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
