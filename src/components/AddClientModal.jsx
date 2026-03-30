import React, { useState } from 'react';
import { X, User, Phone, MapPin, Star, Plus, MessageSquare, Briefcase, Building2, Globe } from 'lucide-react';

const INDUSTRIES = [
  "Clinic / Medical",
  "School / Education",
  "Furniture / Retail",
  "Photographer / Creative",
  "Real Estate",
  "Agency / B2B",
  "E-commerce",
  "Other"
];

const AddClientModal = ({ onClose, onAdd, existingClients = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    companyName: '',
    industry: 'Clinic / Medical',
    website: '',
    source: '',
    rating: 0,
    status: 'Interested',
    needs: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    onAdd(formData);
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value;
    
    // Check if the phone number matches an existing client
    const existingMatch = existingClients.find(c => c.phone && c.phone.replace(/\D/g, '') === newPhone.replace(/\D/g, ''));
    
    if (existingMatch && newPhone.length >= 7) {
      setFormData(prev => ({ 
        ...prev, 
        phone: newPhone,
        name: existingMatch.name || prev.name,
        companyName: existingMatch.companyName || prev.companyName,
        industry: existingMatch.industry || prev.industry,
        website: existingMatch.website || prev.website,
        source: existingMatch.source || prev.source
      }));
    } else {
      setFormData(prev => ({ ...prev, phone: newPhone }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
           <div>
             <h3 className="text-2xl font-bold text-slate-900">Add New Lead</h3>
             <p className="text-slate-500 text-sm mt-1">Capture completely enriched data</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
             <X className="w-6 h-6" />
           </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          <form id="add-client-form" onSubmit={handleSubmit} className="space-y-8">
             
             {/* Section 1: Contact Details */}
             <div>
               <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">Core Identification</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Full Name *</label>
                    <div className="relative group">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                       <input 
                         type="text" 
                         className="input-field pl-12"
                         placeholder="e.g. Ram Bahadur"
                         required
                         autoFocus
                         value={formData.name}
                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                       />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Phone Number *</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="tel" 
                        className="input-field pl-12"
                        placeholder="e.g. 9841234567"
                        required
                        value={formData.phone}
                        onChange={handlePhoneChange}
                      />
                    </div>
                  </div>
               </div>
             </div>

             {/* Section 2: Business Profile */}
             <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Business Profile</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">Business / Company Name</label>
                      <div className="relative group">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                          type="text" 
                          className="input-field pl-12"
                          placeholder="e.g. Everest Dental Clinic"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        />
                      </div>
                   </div>

                   <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">Industry / Niche</label>
                      <div className="relative group">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                        <select 
                          className="input-field pl-12 appearance-none"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        >
                          {INDUSTRIES.map(ind => (
                             <option key={ind} value={ind}>{ind}</option>
                          ))}
                        </select>
                      </div>
                   </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-700 block mb-2">Current Website or Social Link</label>
                   <div className="relative group">
                     <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                     <input 
                       type="url" 
                       className="input-field pl-12"
                       placeholder="e.g. facebook.com/everestdental"
                       value={formData.website}
                       onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                     />
                   </div>
                </div>
             </div>

             {/* Section 3: Context */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Lead Source</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      className="input-field pl-12"
                      placeholder="e.g. Instagram DM, Referral..."
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Initial Lead Quality</label>
                   <p className="text-[10px] text-slate-400 mb-2">Rate out of 5 stars based on potential</p>
                   <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-8 h-8 cursor-pointer transition-transform hover:scale-110 ${star <= formData.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                          onClick={() => setFormData({ ...formData, rating: star })}
                        />
                      ))}
                   </div>
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Initial Requirements & Notes</label>
                <div className="relative group">
                  <MessageSquare className="absolute left-4 top-4 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                  <textarea 
                    className="input-field pl-12 min-h-[100px] resize-none"
                    placeholder="What do they need? (Website, Ads, Full funnel...)"
                    value={formData.needs}
                    onChange={(e) => setFormData({ ...formData, needs: e.target.value })}
                  />
                </div>
             </div>

          </form>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-white flex gap-4 sticky bottom-0 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)]">
           <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-sm">Cancel</button>
           <button type="submit" form="add-client-form" className="btn-primary flex-[2] py-3 text-sm shadow-lg shadow-emerald-500/30">
              <Plus className="w-5 h-5" />
              Save Completely Enriched Lead
           </button>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal;
