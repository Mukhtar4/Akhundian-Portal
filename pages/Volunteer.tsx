import React, { useState } from 'react';
import { VOLUNTEER_ROLES } from '../constants';
import { Send } from 'lucide-react';

const Volunteer: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, send to backend
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-brand-700 mb-4">Application Received!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for offering your time and skills. Our coordinator will review your application and contact you within 3 business days.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="text-brand-600 font-semibold hover:underline"
          >
            Submit another application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Volunteer</h1>
          <p className="text-gray-600">
            Join our family of 1,200+ volunteers working to make a difference.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 px-3 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 px-3 border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 px-3 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interested Role</label>
              <select
                name="roleId"
                required
                value={formData.roleId}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 px-3 border"
              >
                <option value="">Select a role...</option>
                {VOLUNTEER_ROLES.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.title} ({role.type}) - {role.location}
                  </option>
                ))}
                <option value="other">Other / General Volunteer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to join us?</label>
              <textarea
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 px-3 border"
                placeholder="Tell us about your skills and motivation..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition flex items-center justify-center gap-2"
              >
                Submit Application <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Volunteer;