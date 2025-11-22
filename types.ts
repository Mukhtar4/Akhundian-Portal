
export enum ProjectStatus {
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  PLANNED = 'Planned',
}

export type ProjectCategory = 'Education' | 'Health' | 'Social' | 'General';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  category: ProjectCategory;
  subCategory?: string; // e.g., Blood Camp, Scholarship
  startDate: string; // YYYY-MM-DD
  status: ProjectStatus;
  budget: number;
  raised: number;
  beneficiaries?: number; // e.g., Patients treated, Students supported
  image: string;
  tags: string[];
  documents: Document[];
}

export interface Donation {
  id: string;
  donorName: string;
  email?: string;
  amount: number;
  date: string;
  campaign: string;
  category: ProjectCategory;
  status: 'Completed' | 'Pending';
  paymentMethod?: 'Bank Transfer' | 'Cash' | 'Challan' | 'Online';
  challanUrl?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: 'Operational' | 'Project' | 'Marketing' | 'Salary' | 'Logistics';
  category: ProjectCategory;
  status: 'Pending' | 'Approved' | 'Paid';
}

export interface ImpactStat {
  label: string;
  value: number | string;
  iconName: string;
}

export interface VolunteerRole {
  id: string;
  title: string;
  location: string;
  type: 'Remote' | 'On-site';
}

export interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  role: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

export type ExpenseTimeframe = 'weekly' | 'monthly' | 'yearly' | 'session';
