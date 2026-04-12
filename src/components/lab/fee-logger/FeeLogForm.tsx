import React, { useState } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { FeeLogData } from '../../../services/firebaseService';

interface FeeLogFormProps {
  onAddLogs: (logs: Omit<FeeLogData, 'id' | 'createdAt'>[]) => Promise<void>;
}

export default function FeeLogForm({ onAddLogs }: FeeLogFormProps) {
  const [admissionNo, setAdmissionNo] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentName, setStudentName] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [isGPay, setIsGPay] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      if (!admissionNo || !studentName || !feeAmount || !date) {
        throw new Error('Please fill all required fields.');
      }

      await onAddLogs([{
        admissionNo: String(admissionNo),
        studentClass: String(studentClass),
        studentName: String(studentName),
        feeAmount: Number(feeAmount),
        isGPay: Boolean(isGPay),
        date: String(date),
      }]);

      // Reset form
      setAdmissionNo('');
      setStudentClass('');
      setStudentName('');
      setFeeAmount('');
      setIsGPay(false);
      setDate(format(new Date(), 'yyyy-MM-dd'));
    } catch (err: any) {
      console.error('Error adding fee log:', err);
      setError(err.message || 'Failed to log fee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Log New Fee</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Admission No.
            </label>
            <input
              type="text"
              required
              value={admissionNo}
              onChange={(e) => setAdmissionNo(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              placeholder="e.g. 1024"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Class
            </label>
            <input
              type="text"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              placeholder="e.g. 10A"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Student Name
          </label>
          <input
            type="text"
            required
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            placeholder="John Doe"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Fee Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer" onClick={() => setIsGPay(!isGPay)}>
          <input
            type="checkbox"
            id="isGPay"
            checked={isGPay}
            onChange={(e) => setIsGPay(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="isGPay" className="ml-2 block text-sm font-medium text-gray-900 cursor-pointer">
            Paid via Google Pay (GPay)
          </label>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Saving...
              </>
            ) : (
              'Log Fee'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}