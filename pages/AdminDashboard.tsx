
import React, { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, ComposedChart, Line } from 'recharts';
import { Users, DollarSign, Activity, FileText, Loader2, LayoutDashboard, Briefcase, HandHeart, LogOut, Plus, Check, X, Download, TrendingDown, Wallet, Calendar, Trash2, Edit, FolderOpen, Upload, Search, Eye, CreditCard, Image as ImageIcon, Filter } from 'lucide-react';
import { generateImpactReport } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Project, ProjectStatus, Document, ProjectCategory, ExpenseTimeframe, Donation, Expense, VolunteerApplication } from '../types';
import { PROJECT_SUB_CATEGORIES, VOLUNTEER_ROLES } from '../constants';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

type TabView = 'overview' | 'projects' | 'finance' | 'volunteers' | 'documents' | 'reports';

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileType = (filename: string) => {
  return filename.split('.').pop()?.toUpperCase() || 'FILE';
};

// Helper to convert File to Base64 string for persistent storage
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Generate Session Options from 2023-24 to 2049-50
const SESSION_OPTIONS = Array.from({ length: 27 }, (_, i) => {
  const startYear = 2023 + i;
  return `${startYear}-${(startYear + 1).toString().slice(-2)}`;
});

// Helper to check if a date falls within a specific Session (Fiscal Year: July - June)
const isInSession = (dateString: string, session: string) => {
  if (session === 'All') return true;
  const startYear = parseInt(session.split('-')[0]);
  const sessionStart = new Date(startYear, 6, 1); // July
  const sessionEnd = new Date(startYear + 1, 5, 30, 23, 59, 59); // June
  const targetDate = new Date(dateString);
  return targetDate >= sessionStart && targetDate <= sessionEnd;
};

interface ProjectFormState {
  title: string;
  budget: number;
  location: string;
  description: string;
  startDate: string;
  status: ProjectStatus;
  category: ProjectCategory;
  subCategory: string;
  beneficiaries: number;
  documents: Document[];
}

interface DonationFormState {
  donorName: string;
  email: string;
  amount: number;
  date: string;
  campaign: string;
  category: ProjectCategory;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Challan' | 'Online';
  status: 'Completed' | 'Pending';
  notes: string;
  challanUrl: string;
}

interface ExpenseFormState {
  description: string;
  amount: number;
  date: string;
  type: 'Operational' | 'Project' | 'Marketing' | 'Salary' | 'Logistics';
  category: ProjectCategory;
  status: 'Pending' | 'Approved' | 'Paid';
}

interface VolunteerFormState {
  name: string;
  email: string;
  role: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: ProjectFormState;
  setForm: (form: ProjectFormState) => void;
  onSave: (e: React.FormEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveDocument: (id: string) => void;
  uploadError: string;
}

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (donation: DonationFormState) => void;
  projects: Project[];
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: ExpenseFormState) => void;
}

interface DonationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
}

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (volunteer: VolunteerFormState) => void;
}

// Extracted Project Modal
const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen, onClose, isEditing, form, setForm, onSave,
  fileInputRef, onFileSelect, onRemoveDocument, uploadError
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Project' : 'Create New Campaign'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSave} className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
              <input
                placeholder="e.g. Clean Water for Thar"
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                placeholder="e.g. Akhonpa Ghasing"
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as ProjectStatus })}
              >
                <option value={ProjectStatus.PLANNED}>{ProjectStatus.PLANNED}</option>
                <option value={ProjectStatus.ACTIVE}>{ProjectStatus.ACTIVE}</option>
                <option value={ProjectStatus.COMPLETED}>{ProjectStatus.COMPLETED}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={form.category}
                onChange={e => setForm({
                  ...form,
                  category: e.target.value as ProjectCategory,
                  subCategory: ''
                })}
              >
                <option value="Education">Education</option>
                <option value="Health">Health</option>
                <option value="Social">Social</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (PKR)</label>
              <input
                placeholder="0.00"
                type="number"
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.budget}
                onChange={e => setForm({ ...form, budget: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-4 rounded-lg border border-gray-100">
            {PROJECT_SUB_CATEGORIES[form.category] && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{form.category} Type</label>
                <select
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                  value={form.subCategory}
                  onChange={e => setForm({ ...form, subCategory: e.target.value })}
                >
                  <option value="">Select Type...</option>
                  {PROJECT_SUB_CATEGORIES[form.category].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.category === 'Health' ? 'Patients Treated' :
                  form.category === 'Education' ? 'Students Supported' :
                    'Beneficiaries Impacted'}
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={form.beneficiaries}
                onChange={e => setForm({ ...form, beneficiaries: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              required
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.startDate}
              onChange={e => setForm({ ...form, startDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Project details..."
              required
              rows={3}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="border-t border-gray-100 pt-5 mt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-gray-800">Project Documents</label>
              <span className="text-xs text-gray-500">
                {form.documents.length} attached
              </span>
            </div>

            {uploadError && (
              <div className="bg-red-50 text-red-600 text-xs p-2 rounded mb-3 flex items-center gap-1">
                <X className="w-3 h-3" /> {uploadError}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {form.documents.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-2">No documents attached.</p>
                ) : (
                  form.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.url}
                          download={doc.name}
                          className="text-gray-400 hover:text-blue-500 transition p-1"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => onRemoveDocument(doc.id)}
                          className="text-gray-400 hover:text-red-500 transition p-1"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed rounded-lg text-sm font-medium transition border-brand-300 text-brand-600 hover:bg-brand-50"
              >
                <Upload className="w-4 h-4" /> Upload Document
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 shadow-sm transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> {isEditing ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// New Donation Manual Entry Modal
const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, onSave, projects }) => {
  const [form, setForm] = useState<DonationFormState>({
    donorName: '',
    email: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    campaign: 'General Fund',
    category: 'General',
    paymentMethod: 'Cash',
    status: 'Completed',
    notes: '',
    challanUrl: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setForm(prev => ({ ...prev, challanUrl: base64 }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Enter Manual Donation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name</label>
              <input
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.donorName}
                onChange={e => setForm({ ...form, donorName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
              <input
                type="number"
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as any })}
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign/Project</label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={form.campaign}
                onChange={e => {
                  const project = projects.find(p => p.title === e.target.value);
                  setForm({
                    ...form, 
                    campaign: e.target.value,
                    category: project ? project.category : 'General'
                  });
                }}
              >
                <option value="General Fund">General Fund</option>
                {projects.map(p => (
                  <option key={p.id} value={p.title}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={form.paymentMethod}
                onChange={e => setForm({ ...form, paymentMethod: e.target.value as any })}
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Challan">Challan Deposit</option>
                <option value="Online">Online</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={2}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
             <label className="block text-sm font-bold text-gray-800 mb-2">Upload Challan / Receipt</label>
             <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center gap-3">
                {form.challanUrl ? (
                   <div className="relative w-full">
                      <img src={form.challanUrl} alt="Challan Preview" className="h-48 w-full object-contain rounded bg-white border" />
                      <button 
                        type="button"
                        onClick={() => setForm({...form, challanUrl: ''})}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                   </div>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-gray-300" />
                    <p className="text-sm text-gray-500">Click below to upload image (JPG, PNG)</p>
                  </>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*,application/pdf" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm"
                >
                  {form.challanUrl ? 'Change File' : 'Select File'}
                </button>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 flex items-center gap-2">
              <Check className="w-4 h-4" /> Save Donation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Expense Manual Entry Modal
const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState<ExpenseFormState>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'Operational',
    category: 'General',
    status: 'Pending'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Log New Expense</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Date & Amount (Requested Order) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
              <input
                type="number"
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Row 2: Description */}
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                placeholder="e.g. Office Rent, Medical Supplies"
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          {/* Row 3: Type & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as any })}
              >
                <option value="Operational">Operational</option>
                <option value="Project">Project</option>
                <option value="Marketing">Marketing</option>
                <option value="Salary">Salary</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value as any })}
              >
                <option value="Education">Education</option>
                <option value="Health">Health</option>
                <option value="Social">Social</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Row 4: Status */}
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as any })}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 flex items-center gap-2">
              <Check className="w-4 h-4" /> Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// New Volunteer Manual Entry Modal
const VolunteerModal: React.FC<VolunteerModalProps> = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState<VolunteerFormState>({
    name: '',
    email: '',
    role: 'General Volunteer',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Add Volunteer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              required
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="General Volunteer">General Volunteer</option>
              {VOLUNTEER_ROLES.map(role => (
                <option key={role.id} value={role.title}>{role.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as any })}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 flex items-center gap-2">
              <Check className="w-4 h-4" /> Add Volunteer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Donation View Modal
const DonationViewModal: React.FC<DonationViewModalProps> = ({ isOpen, onClose, donation }) => {
  if (!isOpen || !donation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
       <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
             <div>
               <h3 className="text-xl font-bold text-gray-900">Donation Details</h3>
               <p className="text-sm text-gray-500">ID: {donation.id}</p>
             </div>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
             <div className="space-y-4">
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold">Donor Info</p>
                   <p className="text-lg font-medium text-gray-900">{donation.donorName}</p>
                   {donation.email && <p className="text-sm text-gray-600">{donation.email}</p>}
                </div>
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold">Amount</p>
                   <p className="text-2xl font-bold text-green-600">PKR {donation.amount.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold">Date & Status</p>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-700">{donation.date}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${donation.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {donation.status}
                      </span>
                   </div>
                </div>
             </div>
             <div className="space-y-4">
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold">Campaign</p>
                   <p className="text-sm font-medium text-gray-900">{donation.campaign}</p>
                   <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded mt-1">{donation.category}</span>
                </div>
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold">Payment Method</p>
                   <div className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-700">
                      <CreditCard className="w-4 h-4 text-gray-400" /> {donation.paymentMethod || 'N/A'}
                   </div>
                </div>
                {donation.notes && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 mt-1">{donation.notes}</p>
                  </div>
                )}
             </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
             <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
               <FileText className="w-4 h-4" /> Challan / Receipt
             </h4>
             <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center border border-gray-200 min-h-[200px]">
                {donation.challanUrl ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <img src={donation.challanUrl} alt="Receipt" className="max-h-96 max-w-full object-contain rounded shadow-sm bg-white" />
                    <a 
                      href={donation.challanUrl} 
                      download={`Receipt_${donation.id}`}
                      className="flex items-center gap-2 text-brand-600 font-medium hover:underline text-sm"
                    >
                      <Download className="w-4 h-4" /> Download Receipt
                    </a>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No receipt uploaded</p>
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}

// --- Extracted Sub-Views ---

const Overview: React.FC = () => {
  const { donations, expenses, projects, volunteers } = useData();
  const [trendTimeframe, setTrendTimeframe] = useState<ExpenseTimeframe>('yearly');
  const [trendSessionYear, setTrendSessionYear] = useState<string>('2024-25');

  const totalRaised = donations.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const uniqueDonors = new Set(donations.map(d => d.donorName)).size;

  // Dynamic Donation Trends Data based on filter
  const trendData = useMemo(() => {
    if (trendTimeframe === 'monthly') {
      // Show Weeks of current month
      const data = [
        { name: 'Week 1', value: 0 },
        { name: 'Week 2', value: 0 },
        { name: 'Week 3', value: 0 },
        { name: 'Week 4', value: 0 },
      ];
      const now = new Date();
      donations.forEach(d => {
        const date = new Date(d.date);
        if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
           const day = date.getDate();
           const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
           data[weekIndex].value += d.amount;
        }
      });
      return data;
    } else if (trendTimeframe === 'session') {
       // Show Jul - Jun for selected session
       const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
       const data = months.map(name => ({ name, value: 0 }));
       donations.forEach(d => {
          if (isInSession(d.date, trendSessionYear)) {
             const date = new Date(d.date);
             const month = date.getMonth(); // 0-11 (Jan-Dec)
             // Map month to index in 'months' array (Jul=0, Aug=1 ... Dec=5, Jan=6 ... Jun=11)
             const index = month >= 6 ? month - 6 : month + 6;
             data[index].value += d.amount;
          }
       });
       return data;
    } else {
      // Yearly (Jan-Dec) - Default
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = months.map(name => ({ name, value: 0 }));
      donations.forEach(d => {
        const date = new Date(d.date);
        if (!isNaN(date.getTime())) {
          data[date.getMonth()].value += d.amount;
        }
      });
      return data;
    }
  }, [donations, trendTimeframe, trendSessionYear]);

  const pieData = useMemo(() => {
    const catMap: Record<string, number> = {};
    projects.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + p.raised;
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value })).filter(i => i.value > 0);
  }, [projects]);

  // --- New Analytic Data Logic ---

  // Total Income vs Total Expense (Financial Summary)
  const financialSummaryData = useMemo(() => [
    { name: 'Total Income', value: totalRaised },
    { name: 'Total Expense', value: totalExpenses }
  ], [totalRaised, totalExpenses]);

  // 1. Budget vs Raised (Gap Analysis) - Top 5 Active Projects
  const fundingGapData = useMemo(() => {
    return projects
      .slice(0, 5)
      .map(p => ({
        name: p.title.length > 15 ? p.title.substring(0, 12) + '...' : p.title,
        Budget: p.budget,
        Raised: p.raised,
      }));
  }, [projects]);

  // 2. Donor Segmentation (Tiers)
  const donorTierData = useMemo(() => {
    let small = 0; // < 5k
    let medium = 0; // 5k - 50k
    let large = 0; // > 50k
    donations.forEach(d => {
      if (d.amount < 5000) small++;
      else if (d.amount <= 50000) medium++;
      else large++;
    });
    const data = [
      { name: 'Small (<5k)', value: small },
      { name: 'Medium (5k-50k)', value: medium },
      { name: 'Major (>50k)', value: large },
    ].filter(d => d.value > 0);
    return data.length ? data : [{ name: 'No Data', value: 1 }];
  }, [donations]);

  // 3. Geographic Resource Allocation
  const geoData = useMemo(() => {
    const locMap: Record<string, number> = {};
    projects.forEach(p => {
      // Normalize location key slightly
      const loc = p.location.split(',')[0].trim(); 
      locMap[loc] = (locMap[loc] || 0) + p.budget;
    });
    return Object.entries(locMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 locations
  }, [projects]);

  // 4. Project Status Distribution
  const projectStatusData = useMemo(() => {
    const statusCounts = {
      [ProjectStatus.ACTIVE]: 0,
      [ProjectStatus.COMPLETED]: 0,
      [ProjectStatus.PLANNED]: 0
    };
    projects.forEach(p => {
      if (statusCounts[p.status] !== undefined) statusCounts[p.status]++;
    });
    const data = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    return data.some(d => d.value > 0) ? data : [{ name: 'No Projects', value: 1 }];
  }, [projects]);

  // 5. Volunteer Pipeline Status
  const volunteerPipelineData = useMemo(() => {
    const counts = { Pending: 0, Approved: 0, Rejected: 0 };
    volunteers.forEach(v => {
      if (counts[v.status] !== undefined) counts[v.status]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [volunteers]);

  const displayPieData = pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }];
  const displayPieColors = pieData.length > 0 ? COLORS : ['#e5e7eb'];

  return (
    <div className="space-y-8">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full"><DollarSign className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500">Total Raised</p><p className="text-2xl font-bold text-gray-900">PKR {(totalRaised / 1000000).toFixed(1)}M</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Users className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500">Donors</p><p className="text-2xl font-bold text-gray-900">{uniqueDonors}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full"><Activity className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500">Projects</p><p className="text-2xl font-bold text-gray-900">{projects.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><HandHeart className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500">Volunteers</p><p className="text-2xl font-bold text-gray-900">{volunteers.length}</p></div>
        </div>
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <div className="flex justify-between items-start mb-6">
             <h3 className="text-lg font-bold text-gray-800">Donation Trends</h3>
             <div className="flex flex-wrap gap-2 justify-end">
               {trendTimeframe === 'session' && (
                  <select 
                    value={trendSessionYear}
                    onChange={(e) => setTrendSessionYear(e.target.value)}
                    className="text-xs border border-gray-300 rounded p-1 bg-gray-50 outline-none"
                  >
                    {SESSION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               )}
               <div className="flex bg-gray-100 rounded p-0.5">
                 <button 
                   onClick={() => setTrendTimeframe('monthly')}
                   className={`px-2 py-1 text-xs rounded ${trendTimeframe === 'monthly' ? 'bg-white shadow-sm text-brand-700 font-medium' : 'text-gray-500'}`}
                 >
                   Monthly
                 </button>
                 <button 
                   onClick={() => setTrendTimeframe('yearly')}
                   className={`px-2 py-1 text-xs rounded ${trendTimeframe === 'yearly' ? 'bg-white shadow-sm text-brand-700 font-medium' : 'text-gray-500'}`}
                 >
                   Yearly
                 </button>
                 <button 
                   onClick={() => setTrendTimeframe('session')}
                   className={`px-2 py-1 text-xs rounded ${trendTimeframe === 'session' ? 'bg-white shadow-sm text-brand-700 font-medium' : 'text-gray-500'}`}
                 >
                   Session
                 </button>
               </div>
             </div>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" tickFormatter={(val) => `${val / 1000}k`} fontSize={11} />
              <Tooltip formatter={(value) => `PKR ${value.toLocaleString()}`} />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Funds Distribution (By Category)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={displayPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                {displayPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={displayPieColors[index % displayPieColors.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- STRATEGIC INSIGHTS SECTION (NEW 5 CHARTS) --- */}
      <div className="pt-4">
         <h2 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-brand-500 pl-3">Strategic Insights</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Financial Overview (Income vs Expense) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-72 lg:col-span-2">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Financial Health (Income vs Expense)</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={financialSummaryData} layout="vertical" margin={{ left: 40, right: 30 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f3f4f6" />
                   <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(val) => `${val/1000}k`} />
                   <YAxis dataKey="name" type="category" stroke="#4b5563" fontSize={12} width={100} />
                   <Tooltip formatter={(value) => `PKR ${value.toLocaleString()}`} cursor={{fill: '#f9fafb'}} />
                   <Bar dataKey="value" barSize={40}>
                     {financialSummaryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.name === 'Total Income' ? '#10b981' : '#ef4444'} />
                     ))}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 2. Project Status Mix */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-72">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Project Status Mix</h3>
              <ResponsiveContainer width="100%" height="85%">
                 <PieChart>
                    <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} fill="#8884d8" dataKey="value" paddingAngle={2}>
                       {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Active' ? '#10b981' : entry.name === 'Completed' ? '#3b82f6' : '#f59e0b'} />
                       ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                 </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 3. Project Funding Gaps */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-72 lg:col-span-2">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Project Financial Health (Budget vs Raised)</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={fundingGapData} barGap={0} barCategoryGap="20%">
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                   <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                   <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(val) => `${val/1000}k`} />
                   <Tooltip formatter={(value) => `PKR ${value.toLocaleString()}`} cursor={{fill: 'transparent'}} />
                   <Legend />
                   <Bar dataKey="Budget" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="Raised" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 4. Donor Segmentation */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-72">
               <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Donor Segmentation</h3>
               <ResponsiveContainer width="100%" height="85%">
                 <PieChart>
                    <Pie data={donorTierData} cx="50%" cy="50%" outerRadius={70} fill="#8884d8" dataKey="value" labelLine={false}>
                       {donorTierData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconSize={8} fontSize={10} />
                 </PieChart>
               </ResponsiveContainer>
            </div>

            {/* 5. Geographic Distribution */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-72">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Budget by Location</h3>
              <ResponsiveContainer width="100%" height="85%">
                 <BarChart data={geoData} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={10} tickFormatter={(val) => `${val/1000}k`} />
                    <YAxis dataKey="name" type="category" stroke="#4b5563" fontSize={11} width={100} />
                    <Tooltip formatter={(value) => `PKR ${value.toLocaleString()}`} cursor={{fill: '#f9fafb'}} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={15} />
                 </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 6. Volunteer Pipeline */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-72">
               <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Volunteer Pipeline</h3>
               <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={volunteerPipelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorVol)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

interface ProjectsViewProps {
  onAddProject: () => void;
  onEditProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ onAddProject, onEditProject, onDeleteProject }) => {
  const { projects } = useData();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sessionFilter, setSessionFilter] = useState<string>('All');

  const filteredProjects = projects.filter(p => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSession = isInSession(p.startDate, sessionFilter);
    return matchesCategory && matchesSession;
  });

  const impactData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredProjects.forEach(p => {
      const key = p.subCategory || p.category;
      data[key] = (data[key] || 0) + (p.beneficiaries || 0);
    });
    return Object.entries(data).map(([name, count]) => ({ name, count })).filter(d => d.count > 0);
  }, [filteredProjects]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
        <button
          onClick={onAddProject}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-brand-700"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="flex flex-wrap gap-4 bg-white p-3 rounded-lg border border-gray-200 w-fit">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">Category:</span>
          <select
            className="bg-gray-50 border-gray-300 border rounded text-sm p-1 outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Social">Social</option>
            <option value="General">General</option>
          </select>
        </div>

        <div className="w-px bg-gray-300 h-6"></div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">Session:</span>
          <select
            className="bg-gray-50 border-gray-300 border rounded text-sm p-1 outline-none"
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
          >
            <option value="All">All Sessions</option>
            {SESSION_OPTIONS.map((session) => (
              <option key={session} value={session}>{session}</option>
            ))}
          </select>
        </div>
      </div>

      {impactData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-72">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Impact Analysis (Beneficiaries Treated/Supported)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={impactData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" width={120} />
              <Tooltip cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Project</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Start Date</th>
              <th className="px-6 py-3">Impact</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Budget</th>
              <th className="px-6 py-3">Raised</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProjects.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {p.title}
                  {p.documents && p.documents.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <FileText className="w-3 h-3" /> {p.documents.length} files
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700 w-fit">{p.category}</span>
                    {p.subCategory && <span className="text-xs text-gray-500 mt-1 ml-1">{p.subCategory}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">{p.startDate}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {p.beneficiaries ? p.beneficiaries.toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'Active' ? 'bg-green-100 text-green-700' :
                      p.status === 'Planned' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>{p.status}</span>
                </td>
                <td className="px-6 py-4">Rs. {p.budget.toLocaleString()}</td>
                <td className="px-6 py-4">Rs. {p.raised.toLocaleString()}</td>
                <td className="px-6 py-4 flex justify-end gap-3">
                  <button onClick={() => onEditProject(p)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition"><Edit className="w-4 h-4" /></button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteProject(p.id);
                    }} 
                    className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No projects found for the selected criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FinanceView: React.FC = () => {
  const { donations, expenses, deleteDonation, deleteExpense, projects, addDonation, addExpense } = useData();
  const [mode, setMode] = useState<'donations' | 'expenses'>('expenses');
  const [timeframe, setTimeframe] = useState<ExpenseTimeframe>('monthly');
  const [sessionYear, setSessionYear] = useState<string>('2024-25');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [viewDonation, setViewDonation] = useState<Donation | null>(null);

  const handleDeleteDonation = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this donation record?')) {
      deleteDonation(id);
    }
  };

  const handleDeleteExpense = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      deleteExpense(id);
    }
  };

  const handleSaveDonation = (form: DonationFormState) => {
    const newDonation: Donation = {
      id: `don_${Date.now()}`,
      donorName: form.donorName,
      email: form.email,
      amount: form.amount,
      date: form.date,
      campaign: form.campaign,
      category: form.category,
      status: form.status,
      paymentMethod: form.paymentMethod,
      notes: form.notes,
      challanUrl: form.challanUrl
    };
    addDonation(newDonation);
    setIsDonationModalOpen(false);
  };

  const handleSaveExpense = (form: ExpenseFormState) => {
    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      description: form.description,
      amount: form.amount,
      date: form.date,
      type: form.type,
      category: form.category,
      status: form.status
    };
    addExpense(newExpense);
    setIsExpenseModalOpen(false);
  };

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(expense => {
      const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;
      if (!matchesCategory) return false;

      if (timeframe === 'session') {
        return isInSession(expense.date, sessionYear);
      }

      const expenseDate = new Date(expense.date);
      const diffTime = Math.abs(now.getTime() - expenseDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (timeframe === 'weekly') return diffDays <= 7;
      if (timeframe === 'monthly') return diffDays <= 30;
      if (timeframe === 'yearly') return diffDays <= 365;
      return true;
    });
  }, [timeframe, categoryFilter, expenses, sessionYear]);

  const filteredDonations = useMemo(() => {
    return donations.filter(d => {
      const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;
      if (!matchesCategory) return false;

      if (timeframe === 'session') {
        return isInSession(d.date, sessionYear);
      }

      const now = new Date();
      const dDate = new Date(d.date);
      const diffTime = Math.abs(now.getTime() - dDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (timeframe === 'weekly') return diffDays <= 7;
      if (timeframe === 'monthly') return diffDays <= 30;
      if (timeframe === 'yearly') return diffDays <= 365;
      return true;
    });
  }, [categoryFilter, donations, timeframe, sessionYear]);

  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = useMemo(() => {
    if (timeframe === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const data = days.map(d => ({ name: d, value: 0 }));
      filteredExpenses.forEach(e => {
        const dayIndex = new Date(e.date).getDay();
        data[dayIndex].value += e.amount;
      });
      return data;
    }
    if (timeframe === 'monthly') {
      const data = [
        { name: 'Week 1', value: 0 },
        { name: 'Week 2', value: 0 },
        { name: 'Week 3', value: 0 },
        { name: 'Week 4', value: 0 },
      ];
      filteredExpenses.forEach(e => {
        const day = new Date(e.date).getDate();
        const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
        data[weekIndex].value += e.amount;
      });
      return data;
    }
    if (timeframe === 'session') {
      // Session view: July to June
      const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const data = months.map(m => ({ name: m, value: 0 }));
      filteredExpenses.forEach(e => {
        const date = new Date(e.date);
        const month = date.getMonth(); // 0-11 (Jan-Dec)
        // Map month to index in 'months' array (Jul=0, Aug=1 ... Dec=5, Jan=6 ... Jun=11)
        const index = month >= 6 ? month - 6 : month + 6;
        data[index].value += e.amount;
      });
      return data;
    }
    if (timeframe === 'yearly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = months.map(m => ({ name: m, value: 0 }));
      filteredExpenses.forEach(e => {
        const monthIndex = new Date(e.date).getMonth();
        data[monthIndex].value += e.amount;
      });
      return data;
    }
    return [];
  }, [filteredExpenses, timeframe]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Financial Hub</h2>
        <div className="bg-gray-100 p-1 rounded-lg flex items-center">
          <button
            onClick={() => setMode('donations')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'donations' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Donations (In)
          </button>
          <button
            onClick={() => setMode('expenses')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${mode === 'expenses' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Expenses (Out)
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">Category:</span>
          <select
            className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-brand-500 outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Sectors</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Social">Social</option>
            <option value="General">General</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {timeframe === 'session' && (
            <select
              className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-brand-500 outline-none"
              value={sessionYear}
              onChange={(e) => setSessionYear(e.target.value)}
            >
              {SESSION_OPTIONS.map((session) => (
                <option key={session} value={session}>Session {session}</option>
              ))}
            </select>
          )}

          <div className="inline-flex bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
            <button onClick={() => setTimeframe('weekly')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${timeframe === 'weekly' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Weekly</button>
            <button onClick={() => setTimeframe('monthly')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${timeframe === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Monthly</button>
            <button onClick={() => setTimeframe('yearly')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${timeframe === 'yearly' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Yearly</button>
            <button onClick={() => setTimeframe('session')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${timeframe === 'session' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Session</button>
          </div>
        </div>
      </div>

      {mode === 'donations' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Incoming Donations {categoryFilter !== 'All' && `(${categoryFilter})`}</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsDonationModalOpen(true)}
                className="flex items-center gap-2 bg-brand-600 text-white hover:bg-brand-700 px-4 py-2 rounded-lg text-sm transition shadow-sm"
              >
                <Plus className="w-4 h-4" /> Enter Manual Donation
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-brand-600 border border-gray-300 px-4 py-2 rounded-lg text-sm">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Donor</th>
                <th className="px-6 py-3">Campaign</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Amount (PKR)</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDonations.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">{d.date}</td>
                  <td className="px-6 py-4 font-medium">{d.donorName}</td>
                  <td className="px-6 py-4 text-gray-500">{d.campaign}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-600 font-medium">{d.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 text-green-600">+Rs. {d.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${d.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => setViewDonation(d)}
                      className="text-gray-400 hover:text-blue-600 p-2 rounded transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => handleDeleteDonation(e, d.id)} 
                      className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDonations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No donations found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          <DonationModal 
            isOpen={isDonationModalOpen}
            onClose={() => setIsDonationModalOpen(false)}
            onSave={handleSaveDonation}
            projects={projects}
          />
          
          <DonationViewModal 
            isOpen={!!viewDonation}
            onClose={() => setViewDonation(null)}
            donation={viewDonation}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm text-gray-500 uppercase tracking-wider font-medium">Total Spent ({timeframe})</h4>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">Rs. {totalExpenses.toLocaleString()}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm text-gray-500 uppercase tracking-wider font-medium">Burn Rate</h4>
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">Rs. {Math.round(totalExpenses / (timeframe === 'weekly' ? 7 : timeframe === 'monthly' ? 30 : timeframe === 'session' ? 365 : 365)).toLocaleString()}<span className="text-sm text-gray-400 font-normal">/day</span></p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm text-gray-500 uppercase tracking-wider font-medium">Pending Approval</h4>
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {filteredExpenses.filter(e => e.status === 'Pending').length}
              </p>
              <p className="text-xs text-gray-400 mt-1">Invoices waiting for review</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" /> Expense Analysis
              </h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip
                    formatter={(value) => `PKR ${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f9fafb' }}
                  />
                  <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Expense Type Breakdown</h3>
              <div className="space-y-4">
                {['Operational', 'Project', 'Marketing', 'Salary'].map((cat, idx) => (
                  <div key={cat} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-sm text-gray-600">{cat}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.floor(Math.random() * 30) + 5}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Expense History</h3>
              <button 
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
              >
                <Plus className="w-4 h-4" /> Add Expense
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Amount (PKR)</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> {e.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{e.description}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                        {e.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 border border-gray-200 rounded text-xs text-gray-500 font-medium">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600">-Rs. {e.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${e.status === 'Paid' ? 'bg-gray-100 text-gray-600' :
                          e.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        type="button"
                        onClick={(ev) => handleDeleteExpense(ev, e.id)} 
                        className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No expenses found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <ExpenseModal
            isOpen={isExpenseModalOpen}
            onClose={() => setIsExpenseModalOpen(false)}
            onSave={handleSaveExpense}
          />
        </div>
      )}
    </div>
  );
};

const DocumentsView: React.FC = () => {
  const { documents, addDocument, deleteDocument } = useData();
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');

  const handleGlobalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    
    // Convert to Base64 for persistent storage in IDB
    const base64 = await fileToBase64(file);

    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      name: file.name,
      type: getFileType(file.name),
      size: formatFileSize(file.size),
      date: new Date().toISOString().split('T')[0],
      url: base64 // Storing Base64 instead of blob URL
    };
    await addDocument(newDoc);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteDocument = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Delete this document permanently?')) {
      await deleteDocument(id);
      setUploadError('');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(docSearchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(docSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Hub</h2>
          <p className="text-sm text-gray-500 mt-1">Centralized storage for all project and administrative files.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-500 outline-none w-64"
              value={docSearchTerm}
              onChange={(e) => setDocSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-brand-700"
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleGlobalFileSelect}
          className="hidden"
        />
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <X className="w-4 h-4 cursor-pointer" onClick={() => setUploadError('')} /> {uploadError}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Date Added</th>
              <th className="px-6 py-3">Size</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDocuments.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <a href={doc.url} download={doc.name} className="font-medium text-gray-900 hover:text-brand-600 hover:underline">{doc.name}</a>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs font-bold">{doc.type}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{doc.date}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{doc.size}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <a
                    href={doc.url}
                    download={doc.name}
                    className="text-gray-400 hover:text-blue-500 p-2 rounded transition"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button 
                    type="button"
                    onClick={(e) => handleDeleteDocument(e, doc.id)} 
                    className="text-red-600 hover:bg-red-50 p-2 rounded transition" 
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredDocuments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                  {docSearchTerm ? 'No documents match your search.' : 'No documents uploaded yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="text-right text-xs text-gray-400">
        Total: {documents.length} files
      </div>
    </div>
  );
};

const VolunteersView: React.FC = () => {
  const { volunteers, deleteVolunteer, addVolunteer } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteVolunteer = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this volunteer application?')) {
      deleteVolunteer(id);
    }
  };

  const handleSaveVolunteer = (form: VolunteerFormState) => {
    const newVolunteer: VolunteerApplication = {
      id: `vol_${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role,
      date: form.date,
      status: form.status
    };
    addVolunteer(newVolunteer);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Volunteer Applications</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-green-700"
        >
          <Plus className="w-4 h-4" /> Add Volunteer
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Date Applied</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {volunteers.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{app.name}</div>
                  <div className="text-xs text-gray-500">{app.email}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{app.role}</td>
                <td className="px-6 py-4 text-gray-500">{app.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                  <button className="p-1 text-gray-400 hover:bg-gray-50 rounded"><X className="w-4 h-4" /></button>
                  <button 
                    type="button"
                    onClick={(e) => handleDeleteVolunteer(e, app.id)} 
                    className="p-1 text-red-600 hover:bg-red-50 rounded" 
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {volunteers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No volunteer applications found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <VolunteerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVolunteer}
      />
    </div>
  );
};

const ReportsView: React.FC = () => {
  const { projects } = useData();
  const [aiReport, setAiReport] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    const report = await generateImpactReport(projects);
    setAiReport(report);
    setGenerating(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">AI Impact Generator</h2>
        <p className="text-gray-600">Generate executive summaries for stakeholders.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
        <div className="min-h-[200px] bg-gray-50 rounded-lg p-6 mb-6 text-gray-700 leading-relaxed">
          {aiReport ? aiReport : <span className="text-gray-400 italic flex items-center justify-center h-full">Generated report will appear here...</span>}
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate New Report with Gemini'}
        </button>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    projects, addProject, updateProject, deleteProject, addDocument, addExpense
  } = useData();

  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectUploadError, setProjectUploadError] = useState('');
  
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  const [projectForm, setProjectForm] = useState<ProjectFormState>({
    title: '',
    budget: 0,
    location: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    status: ProjectStatus.PLANNED,
    category: 'General',
    subCategory: '',
    beneficiaries: 0,
    documents: []
  });

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  const openAddProject = () => {
    setProjectForm({
      title: '',
      budget: 0,
      location: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      status: ProjectStatus.PLANNED,
      category: 'General',
      subCategory: '',
      beneficiaries: 0,
      documents: []
    });
    setProjectUploadError('');
    setIsEditing(false);
    setIsProjectModalOpen(true);
  };

  const openEditProject = (project: Project) => {
    setProjectForm({
      title: project.title,
      budget: project.budget,
      location: project.location,
      description: project.description,
      startDate: project.startDate || new Date().toISOString().split('T')[0],
      status: project.status,
      category: project.category,
      subCategory: project.subCategory || '',
      beneficiaries: project.beneficiaries || 0,
      documents: project.documents || []
    });
    setCurrentProjectId(project.id);
    setProjectUploadError('');
    setIsEditing(true);
    setIsProjectModalOpen(true);
  };

  const handleProjectFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProjectUploadError('');
    // Convert to Base64 for persistence
    const base64 = await fileToBase64(file);
    
    const newDoc: Document = {
      id: `p_doc_${Date.now()}`,
      name: file.name,
      type: getFileType(file.name),
      size: formatFileSize(file.size),
      date: new Date().toISOString().split('T')[0],
      url: base64 // Base64 string
    };

    setProjectForm(prev => ({
      ...prev,
      documents: [newDoc, ...prev.documents]
    }));
    if (projectFileInputRef.current) projectFileInputRef.current.value = '';
  };

  const handleRemoveProjectDocument = (docId: string) => {
    setProjectForm(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== docId)
    }));
    setProjectUploadError('');
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData: Project = {
      id: isEditing && currentProjectId ? currentProjectId : Date.now().toString(),
      title: projectForm.title,
      description: projectForm.description,
      location: projectForm.location,
      startDate: projectForm.startDate,
      status: projectForm.status,
      category: projectForm.category,
      subCategory: projectForm.subCategory,
      beneficiaries: projectForm.beneficiaries,
      budget: projectForm.budget,
      raised: isEditing && currentProjectId ? projects.find(p => p.id === currentProjectId)?.raised || 0 : 0,
      image: `https://picsum.photos/800/600?random=${Math.random()}`,
      tags: [projectForm.category],
      documents: projectForm.documents
    };

    // Sync documents to the global Document Hub
    projectData.documents.forEach(doc => {
      addDocument(doc);
    });

    if (isEditing) {
      updateProject(projectData);
    } else {
      addProject(projectData);
      
      // Automatically add Project Budget as an Expense
      if (projectData.budget > 0) {
        const budgetExpense: Expense = {
          id: `exp_budget_${projectData.id}_${Date.now()}`,
          description: `Budget Allocation: ${projectData.title}`,
          amount: projectData.budget,
          date: projectData.startDate,
          type: 'Project',
          category: projectData.category,
          status: 'Pending'
        };
        addExpense(budgetExpense);
      }
    }
    setIsProjectModalOpen(false);
  };

  const renderSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-80px)] flex flex-col hidden md:flex">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col items-center gap-3 mb-2">
             <img 
                src="https://akhundian.org/wp-content/uploads/2022/02/Akhundian-Foundation-Logo.png" 
                alt="Akhundian Foundation" 
                className="h-16 w-auto object-contain mb-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://picsum.photos/seed/akhundian/200/200`;
                }}
              />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{user?.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
      <nav className="flex-grow p-4 space-y-1">
        {[
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'projects', label: 'Projects', icon: Briefcase },
          { id: 'finance', label: 'Finance', icon: DollarSign },
          { id: 'volunteers', label: 'Volunteers', icon: HandHeart },
          { id: 'documents', label: 'Documents', icon: FolderOpen },
          { id: 'reports', label: 'AI Reports', icon: FileText },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabView)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === item.id ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <item.icon className="w-5 h-5" /> {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {renderSidebar()}
      <div className="flex-grow flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 border-b flex justify-between items-center">
          <span className="font-bold">Admin Panel</span>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('overview')}><LayoutDashboard className="w-5 h-5" /></button>
            <button onClick={logout}><LogOut className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-6 md:p-10 overflow-y-auto h-[calc(100vh-64px)] md:h-auto">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'projects' && (
            <ProjectsView 
              onAddProject={openAddProject} 
              onEditProject={openEditProject} 
              onDeleteProject={handleDeleteProject} 
            />
          )}
          {activeTab === 'finance' && <FinanceView />}
          {activeTab === 'volunteers' && <VolunteersView />}
          {activeTab === 'documents' && <DocumentsView />}
          {activeTab === 'reports' && <ReportsView />}
        </div>
      </div>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        isEditing={isEditing}
        form={projectForm}
        setForm={setProjectForm}
        onSave={handleSaveProject}
        fileInputRef={projectFileInputRef}
        onFileSelect={handleProjectFileSelect}
        onRemoveDocument={handleRemoveProjectDocument}
        uploadError={projectUploadError}
      />
    </div>
  );
};

export default AdminDashboard;
