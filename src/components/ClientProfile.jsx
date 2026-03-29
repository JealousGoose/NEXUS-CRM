import React, { useState } from 'react';
import { 
  ArrowLeft, 
  PhoneCall, 
  Calendar, 
  Star, 
  Save, 
  MessageSquare,
  Plus,
  History,
  MapPin,
  MessageCircle,
  Clock,
  CheckCircle2,
  FileText,
  Building2,
  Globe,
  Briefcase
} from 'lucide-react';
import { getWhatsAppLink, getSmartMessage } from '../utils';

const ClientProfile = ({ client, onBack, onAddLog, onUpdateClient }) => {
  const [newLog, setNewLog] = useState({ note: '', status: client.status, followUpDate: '', meetingDate: '' });
  const [isEditingNeeds, setIsEditingNeeds] = useState(false);
  const [needs, setNeeds] = useState(client.needs || '');
  const [rating, setRating] = useState(client.rating || 0);

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newLog.note) return;
    onAddLog(newLog);
    setNewLog({ note: '', status: client.status, followUpDate: '', meetingDate: '' });
  };

  const handleSaveProfile = () => {
    onUpdateClient({ 
      ...client, 
      needs, 
      rating
    });
    setIsEditingNeeds(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Top Action Bar - Sticky */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 sticky top-0 md:top-2 z-50">
        <button onClick={onBack} className="btn-secondary px-4 py-2 text-sm bg-slate-50 border-transparent shadow-none hover:bg-slate-100 flex gap-2 items-center text-slate-600">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
          <span className="font-bold sm:inline hidden">Back to List</span>
        </button>
        
        <div className="flex gap-2">
           <a 
             href={`tel:${client.phone}`}
             className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-semibold flex items-center gap-2"
           >
              <PhoneCall className="w-4 h-4" />
              <span className="hidden sm:inline">Call</span>
           </a>
           <a 
             href={getWhatsAppLink(client.phone, getSmartMessage(client))}
             target="_blank" rel="noopener noreferrer"
             className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition-colors font-semibold flex items-center gap-2"
           >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
           </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dossier */}
        <div className="lg:col-span-1 space-y-6">
          {/* Identity Card */}
          <div className="card-container p-6 relative">
            <div className="flex justify-between items-start mb-4">
               <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700 text-2xl border-2 border-white shadow-sm">
                    {client.name.charAt(0)}
                  </div>
               </div>
               <span className={`badge ${
                      client.status === 'Interested' ? 'badge-emerald' : 
                      client.status === 'Follow up tomorrow' ? 'badge-amber' : 
                      client.status === 'Not interested' ? 'badge-rose' : 
                      client.status === 'Meeting Booked' ? 'badge-purple' : 'badge-slate'
               }`}>
                  {client.status || 'New'}
               </span>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{client.companyName || client.name}</h2>
            <div className="font-medium text-slate-500 mb-4">{client.phone} {client.companyName ? `• ${client.name}` : ''}</div>

            <div className="flex items-center gap-2 mb-4">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Quality:</span>
               {[1, 2, 3, 4, 5].map(star => (
                 <Star 
                   key={star} 
                   className={`w-5 h-5 cursor-pointer transition-transform hover:scale-110 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
                   onClick={() => setRating(star)}
                 />
               ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
               {client.industry && (
                 <div className="flex justify-between items-center text-slate-600">
                    <div className="flex items-center gap-2 font-medium">
                       <Briefcase className="w-4 h-4 text-slate-400" /> Industry
                    </div>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs uppercase tracking-wider">{client.industry}</span>
                 </div>
               )}
               {client.website && (
                 <div className="flex justify-between items-center text-slate-600">
                    <div className="flex items-center gap-2 font-medium">
                       <Globe className="w-4 h-4 text-slate-400" /> Web Link
                    </div>
                    <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-600 hover:underline">
                       Visit Link
                    </a>
                 </div>
               )}
               <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-50 border-dashed">
                  <div className="flex items-center gap-2 font-medium">
                     <MapPin className="w-4 h-4 text-slate-400" /> Source
                  </div>
                  <span className="font-bold text-slate-900">{client.source || 'Manual Entry'}</span>
               </div>
               <div className="flex justify-between items-center text-slate-600">
                  <div className="flex items-center gap-2 font-medium">
                     <Clock className="w-4 h-4 text-slate-400" /> Next Follow-up
                  </div>
                  <span className="font-bold text-slate-900">
                     {client.followUpDate ? new Date(client.followUpDate).toLocaleDateString() : 'Unscheduled'}
                  </span>
               </div>
               {client.meetingDate && (
                 <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-50 border-dashed">
                    <div className="flex items-center gap-2 font-medium">
                       <Clock className="w-4 h-4 text-purple-400" /> Next Meeting
                    </div>
                    <span className="font-bold text-slate-900 bg-purple-100 px-2 py-0.5 rounded text-xs uppercase tracking-wider">
                       {new Date(client.meetingDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                 </div>
               )}
            </div>
          </div>

          {/* Discovery Notes */}
          <div className="card-container p-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" /> Client Notes
                </h3>
             </div>
             
             {isEditingNeeds ? (
               <div className="space-y-3">
                 <textarea 
                   className="input-field min-h-[150px] resize-none text-sm"
                   value={needs}
                   onChange={(e) => setNeeds(e.target.value)}
                   placeholder="E.g. Wants a simple website by Friday..."
                 />
                 <div className="flex gap-2">
                    <button onClick={() => setIsEditingNeeds(false)} className="btn-secondary py-2 text-sm flex-1">Cancel</button>
                    <button onClick={handleSaveProfile} className="btn-primary py-2 text-sm flex-1">Save Notes</button>
                 </div>
               </div>
             ) : (
               <div 
                 className="p-4 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors group relative"
                 onClick={() => setIsEditingNeeds(true)}
               >
                 <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[60px]">
                   {needs || "Click to add requirements, budget, or other permanent notes about this client."}
                 </p>
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-md shadow-sm border border-slate-100">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Right Column: Interaction Tracking */}
        <div className="lg:col-span-2 space-y-6">
           {/* Add New Log Form (Prominent) */}
           <div className="card-container p-6 border-emerald-200 bg-emerald-50/30">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <History className="w-5 h-5 text-emerald-600" /> Log Interaction
              </h3>
              <form onSubmit={handleAddLog} className="space-y-4">
                 <div>
                   <textarea 
                     className="input-field border-emerald-200 bg-white min-h-[100px] resize-none text-base font-medium placeholder:text-slate-400"
                     value={newLog.note}
                     onChange={(e) => setNewLog({ ...newLog, note: e.target.value })}
                     placeholder="What did you talk about? e.g., 'Called them, they were busy. Call back tomorrow at 2 PM.'"
                   />
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-2">Update Status</label>
                       <select 
                         className="input-field py-2.5 font-semibold text-sm"
                         value={newLog.status}
                         onChange={(e) => setNewLog({ ...newLog, status: e.target.value })}
                       >
                         <option value="Interested">Interested</option>
                         <option value="Follow up tomorrow">Follow up tomorrow</option>
                         <option value="Meeting Booked">Meeting Booked</option>
                         <option value="Not interested">Not interested</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-2">Schedule Next Follow-up</label>
                       <input 
                         type="date"
                         className="input-field py-2.5 font-semibold text-sm"
                         value={newLog.followUpDate}
                         onChange={(e) => setNewLog({ ...newLog, followUpDate: e.target.value })}
                       />
                    </div>
                    {newLog.status === 'Meeting Booked' && (
                        <div className="sm:col-span-2">
                           <label className="text-xs font-bold text-purple-600 uppercase tracking-widest block mb-2">Schedule Meeting Time</label>
                           <input 
                             type="datetime-local"
                             className="input-field py-2.5 font-semibold text-sm border-purple-200 focus:border-purple-500 focus:ring-purple-500/10"
                             value={newLog.meetingDate}
                             onChange={(e) => setNewLog({ ...newLog, meetingDate: e.target.value })}
                           />
                        </div>
                    )}
                 </div>

                 <div className="flex justify-end pt-2">
                    <button 
                      type="submit" 
                      className={`btn-primary shadow-lg ${!newLog.note ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!newLog.note}
                    >
                       <Plus className="w-5 h-5" /> Save Interaction Log
                    </button>
                 </div>
              </form>
           </div>

           {/* History List */}
           <div className="card-container p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Past Interactions ({client.logs.length})</h3>
              
              <div className="space-y-6">
                 {client.logs.length > 0 ? (
                   client.logs.map((log) => (
                     <div key={log.id} className="relative pl-6 border-l-2 border-slate-200">
                        <div className="absolute top-1.5 -left-[9px] w-4 h-4 bg-white rounded-full border-4 border-emerald-500 shadow-sm"></div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                           <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-bold text-slate-500 tracking-wider bg-white px-2 py-1 rounded border border-slate-200">
                                {new Date(log.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                              <span className={`badge text-[10px] py-0.5 ${
                                log.status === 'Interested' ? 'badge-emerald' : 
                                log.status === 'Follow up tomorrow' ? 'badge-amber' : 
                                log.status === 'Meeting Booked' ? 'badge-purple' : 'badge-rose'
                              }`}>
                                {log.status}
                              </span>
                           </div>
                           <p className="text-slate-700 text-base font-medium whitespace-pre-wrap">
                              {log.note}
                           </p>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                         <MessageCircle className="w-8 h-8 text-slate-300" />
                      </div>
                      <h4 className="font-bold text-slate-700 mb-1">No conversation history yet</h4>
                      <p className="text-sm text-slate-500">Log your first call or message above to start tracking.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
