import React, { useState, useEffect } from 'react';
import { Mail, Users, RefreshCw, Download, ArrowLeft } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

interface EmailEntry {
  id: number;
  email: string;
  created_at: string;
}

interface LeadEntry {
  id: number;
  type: string;
  value: string;
  result_id: string | null;
  created_at: string;
}

export const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [leads, setLeads] = useState<LeadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const emailsQuery = query(collection(db, 'emails'), orderBy('createdAt', 'desc'));
      const leadsQuery = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));

      const [emailsSnapshot, leadsSnapshot] = await Promise.all([
        getDocs(emailsQuery),
        getDocs(leadsQuery)
      ]);

      const emailsData = emailsSnapshot.docs.map(doc => ({
        id: doc.id as any,
        email: doc.data().email,
        created_at: doc.data().createdAt
      }));

      const leadsData = leadsSnapshot.docs.map(doc => ({
        id: doc.id as any,
        type: doc.data().type,
        value: doc.data().value,
        result_id: doc.data().resultId,
        created_at: doc.data().createdAt
      }));

      setEmails(emailsData);
      setLeads(leadsData);
    } catch (err) {
      setError('Failed to load data. Make sure you have admin permissions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-brand-beige p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 bg-white rounded-full shadow-sm hover:bg-brand-brown hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-4xl font-display font-bold text-brand-brown">Admin Dashboard</h1>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-brand-brown text-brand-beige px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-brand-orange transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-6 rounded-2xl mb-8 flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">!</div>
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Newsletter Emails */}
          <div className="bg-white rounded-[2.5rem] shadow-soft border border-brand-brown/5 overflow-hidden flex flex-col h-[600px]">
            <div className="p-8 border-b border-brand-brown/5 flex items-center justify-between bg-brand-brown text-brand-beige">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6" />
                <h2 className="text-xl font-display font-bold">Newsletter Emails</h2>
              </div>
              <button 
                onClick={() => downloadCSV(emails, 'newsletter_emails.csv')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                title="Download CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {emails.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-brand-taupe/40 italic">
                  <Mail className="w-12 h-12 mb-4 opacity-20" />
                  <p>No emails collected yet.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60 border-b border-brand-brown/5">
                      <th className="pb-4">Email</th>
                      <th className="pb-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-brown/5">
                    {emails.map((e) => (
                      <tr key={e.id} className="text-sm">
                        <td className="py-4 font-medium text-brand-brown">{e.email}</td>
                        <td className="py-4 text-brand-taupe/60">{new Date(e.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quiz Leads */}
          <div className="bg-white rounded-[2.5rem] shadow-soft border border-brand-brown/5 overflow-hidden flex flex-col h-[600px]">
            <div className="p-8 border-b border-brand-brown/5 flex items-center justify-between bg-brand-orange text-white">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <h2 className="text-xl font-display font-bold">Quiz Leads</h2>
              </div>
              <button 
                onClick={() => downloadCSV(leads, 'quiz_leads.csv')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                title="Download CSV"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {leads.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-brand-taupe/40 italic">
                  <Users className="w-12 h-12 mb-4 opacity-20" />
                  <p>No leads collected yet.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest text-brand-taupe/60 border-b border-brand-brown/5">
                      <th className="pb-4">Value</th>
                      <th className="pb-4">Type</th>
                      <th className="pb-4">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-brown/5">
                    {leads.map((l) => (
                      <tr key={l.id} className="text-sm">
                        <td className="py-4 font-medium text-brand-brown">{l.value}</td>
                        <td className="py-4 text-brand-taupe/60">{l.type}</td>
                        <td className="py-4 text-brand-taupe/60">{l.result_id || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
