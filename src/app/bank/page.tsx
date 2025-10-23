"use client";

import { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  upiId?: string;
}

const STORAGE_KEY = "eduwork_bank_details";

export default function BankDetailsPage() {
  const [details, setDetails] = useState<BankDetails>({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    upiId: ""
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDetails(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const validate = (): string | null => {
    if (!details.accountHolderName.trim()) return "Account holder name is required";
    if (!details.bankName.trim()) return "Bank name is required";
    if (!details.accountNumber.trim()) return "Account number is required";
    if (!/^\d{6,18}$/.test(details.accountNumber.trim())) return "Account number should be 6-18 digits";
    if (!details.ifsc.trim()) return "IFSC is required";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(details.ifsc.trim())) return "Invalid IFSC format";
    if (details.upiId && !/^[\w.-]+@[\w.-]+$/.test(details.upiId.trim())) return "Invalid UPI ID";
    return null;
  };

  const save = () => {
    setError("");
    setSuccess("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
      setSuccess("Bank details saved successfully");
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDetails({ accountHolderName: "", bankName: "", accountNumber: "", ifsc: "", upiId: "" });
    setSuccess("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Bank Details</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Payout Information</h2>
              <p className="text-gray-600 text-sm">Stored locally on your device. Not shared with any server.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={details.accountHolderName}
                  onChange={(e) => setDetails({ ...details, accountHolderName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Priya Sharma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={details.bankName}
                  onChange={(e) => setDetails({ ...details, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., HDFC Bank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={details.accountNumber}
                  onChange={(e) => setDetails({ ...details, accountNumber: e.target.value.replace(/\s/g, "") })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 012345678901"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={details.ifsc}
                  onChange={(e) => setDetails({ ...details, ifsc: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., HDFC0001234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID (optional)</label>
                <input
                  type="text"
                  value={details.upiId || ""}
                  onChange={(e) => setDetails({ ...details, upiId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., priya@okhdfcbank"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Details"}
                </button>
                <button
                  onClick={clear}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>

              {error && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{success}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">These details are only stored in your browser (localStorage).</p>
          </div>
        </div>
      </main>
    </div>
  );
}
