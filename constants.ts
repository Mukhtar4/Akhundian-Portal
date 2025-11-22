
import { Project, ProjectStatus, Donation, VolunteerRole, VolunteerApplication, Expense, Document, ProjectCategory } from './types';
import { Heart, Users, Droplets, BookOpen } from 'lucide-react';

export const NAVIGATION_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects' },
  { name: 'Volunteer', path: '/volunteer' },
  { name: 'Admin', path: '/admin' },
];

export const PROJECTS: Project[] = [];

export const RECENT_DONATIONS: Donation[] = [];

export const PROJECT_SUB_CATEGORIES: Record<ProjectCategory, string[]> = {
  Health: ['Blood Camp', 'Medical Camp', 'Surgical Camp', 'Eye Camp', 'General Health'],
  Education: ['Scholarship', 'School Supplies', 'School Renovation', 'Teacher Training'],
  Social: ['Ration Drive', 'Orphan Support', 'Winter Relief', 'Disaster Relief'],
  General: ['General'],
};

export const VOLUNTEER_ROLES: VolunteerRole[] = [
  { id: 'v1', title: 'Field Coordinator', location: 'Karachi', type: 'On-site' },
  { id: 'v2', title: 'Social Media Manager', location: 'Remote', type: 'Remote' },
  { id: 'v3', title: 'Medical Camp Assistant', location: 'Rural Sindh', type: 'On-site' },
];

export const MOCK_VOLUNTEER_APPS: VolunteerApplication[] = [];

// Helper to get date string for days ago
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export const MOCK_EXPENSES: Expense[] = [];

export const MOCK_DOCUMENTS: Document[] = [];