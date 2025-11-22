import React, { useState } from 'react';
import { CheckCircle, Lock, CreditCard, Heart } from 'lucide-react';
import { generateThankYouMessage } from '../services/geminiService';

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

const Donate: React.FC = () => {
  const [amount, setAmount] = useState<number>(5000);
  const [isCustom, setIsCustom] = useState(false);
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
  const [step, setStep] = useState(1);
  const [donorName, setDonorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call time
    setTimeout(async () => {
      const msg = await generateThankYouMessage(donorName, amount, "General Fund");
      setSuccessMsg(msg);
      setStep(3);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Sidebar - Impact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-brand-900 text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-brand-400 fill-current" /> Why Donate?
              </h3>
              <ul className="space-y-4 text-sm text-brand-100">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-brand-400" />
                  <span>PKR 5,000 provides food rations for a family.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-brand-400" />
                  <span>PKR 15,000 sponsors a child's education term.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-brand-400" />
                  <span>100% transparency in fund utilization.</span>
                </li>
              </ul>
            </div>
            <div className="text-center text-gray-500 text-xs flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Secure SSL Encrypted Payment</span>
            </div>
          </div>

          {/* Right Content - Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
              
              {step === 1 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Donation Amount (PKR)</h2>
                  
                  {/* Frequency Toggle */}
                  <div className="flex p-1 bg-gray-100 rounded-lg mb-8 w-fit">
                    <button
                      onClick={() => setFrequency('once')}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                        frequency === 'once' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Give Once
                    </button>
                    <button
                      onClick={() => setFrequency('monthly')}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                        frequency === 'monthly' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>

                  {/* Amount Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {PRESET_AMOUNTS.map((val) => (
                      <button
                        key={val}
                        onClick={() => { setAmount(val); setIsCustom(false); }}
                        className={`py-3 border-2 rounded-lg font-bold text-lg transition-all ${
                          amount === val && !isCustom
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-gray-200 hover:border-brand-200 text-gray-700'
                        }`}
                      >
                        {val.toLocaleString()}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsCustom(true)}
                      className={`py-3 border-2 rounded-lg font-bold text-lg transition-all ${
                        isCustom
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-200 hover:border-brand-200 text-gray-700'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {isCustom && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enter Amount (PKR)</label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">Rs.</span>
                        </div>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-12 pr-12 sm:text-lg border-gray-300 rounded-md py-3"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-brand-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-brand-700 transition flex items-center justify-center gap-2"
                  >
                    Next Step <CheckCircle className="w-5 h-5" />
                  </button>
                </>
              )}

              {step === 2 && (
                <form onSubmit={handleDonate}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 px-3 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 py-2 px-3 border"
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 border p-3 rounded-lg w-full cursor-not-allowed bg-gray-50">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-500 font-medium">Credit Card / Debit Card</span>
                        </div>
                        {/* Add PayPal or others here */}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Mock Payment: No real charge will occur.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition flex items-center justify-center"
                    >
                      {loading ? 'Processing...' : `Donate PKR ${amount.toLocaleString()}`}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You, {donorName}!</h2>
                  <p className="text-gray-600 mb-8">
                    {successMsg}
                  </p>
                  <button
                    onClick={() => {
                      setStep(1);
                      setDonorName('');
                    }}
                    className="bg-brand-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-700"
                  >
                    Donate Again
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;