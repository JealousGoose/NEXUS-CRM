import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ChevronRight, 
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Hash,
  LayoutGrid,
  List,
  Search,
  X,
  Trash2
} from 'lucide-react';
import { getWhatsAppLink, getSmartMessage } from '../utils';

const BOARD_COLUMNS = [
  { id: 'new', title: 'New Leads', statuses: ['New', 'Contacted', undefined, ''] },
  { id: 'interested', title: 'Interested', statuses: ['Interested'] },
  { id: 'meetings', title: 'Meetings', statuses: ['Meeting Booked'] },
  { id: 'followup', title: 'Follow Up', statuses: ['Follow up tomorrow', 'Follow up later'] },
  { id: 'notinterested', title: 'Not Interested', statuses: ['Not interested'] }
];

const ClientList = ({ clients, onSelectClient, onUpdateClient, onDeleteClient, onDeleteAllClients, title = "All Contacts" }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'
  const [localSearch, setLocalSearch] = useState('');

  // Filter clients by local search (name, phone, company)
  const visibleClients = useMemo(() => {
    if (!localSearch.trim()) return clients;
    const q = localSearch.toLowerCase().trim();
    return clients.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.companyName?.toLowerCase().includes(q)
    );
  }, [clients, localSearch]);

  const handleDragStart = (e, clientId) => {
    e.dataTransfer.setData('clientId', clientId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData('clientId');
    if (clientId && onUpdateClient) {
      const client = clients.find(c => c.id === clientId);
      
      let targetStatus = '';
      if (targetColId === 'new') targetStatus = 'New';
      if (targetColId === 'interested') targetStatus = 'Interested';
      if (targetColId === 'meetings') targetStatus = 'Meeting Booked';
      if (targetColId === 'followup') targetStatus = 'Follow up later';
      if (targetColId === 'notinterested') targetStatus = 'Not interested';

      if (client && client.status !== targetStatus) {
        onUpdateClient({ ...client, status: targetStatus });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {localSearch ? `${visibleClients.length} of ${clients.length}` : clients.length} Total Leads
            {onDeleteAllClients && clients.length > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteAllClients(); }}
                className="ml-2 px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md transition-colors text-xs font-bold border border-rose-200 uppercase tracking-wider flex items-center gap-1 shadow-sm"
                title="Delete ALL Contacts"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Inline Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name or phone..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-48 sm:w-64 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white pl-9 pr-8 py-2 rounded-xl text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all border border-transparent focus:border-emerald-200 dark:focus:border-emerald-800"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'board' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="card-container flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="hidden lg:table-cell px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="hidden md:table-cell px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Contact</th>
                  <th className="hidden lg:table-cell px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleClients.length > 0 ? (
                  visibleClients.map((c) => (
                    <tr 
                      key={c.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectClient(c.id)}
                    >
                      <td className="px-4 sm:px-6 py-4 max-w-[150px] sm:max-w-none overflow-hidden">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                              {c.name.charAt(0).toUpperCase()}
                           </div>
                           <div>
                             <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                                {c.companyName || c.name}
                                {c.companyName && <span className="text-xs font-medium text-slate-500 dark:text-slate-400">({c.name})</span>}
                             </div>
                             <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-2">
                                {c.industry && <span className="text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 text-[10px] uppercase font-bold tracking-wider">{c.industry}</span>}
                                {c.phone}
                             </div>
                           </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4">
                        <span className={`badge ${
                          c.status === 'Interested' ? 'badge-emerald' : 
                          c.status === 'Follow up tomorrow' || c.status === 'Follow up later' ? 'badge-amber' : 
                          c.status === 'Not interested' ? 'badge-rose' : 
                          c.status === 'Meeting Booked' ? 'badge-purple' : 'badge-slate'
                        }`}>
                          {c.status || 'New'}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700">{c.lastContacted ? new Date(c.lastContacted).toLocaleDateString() : 'Never'}</span>
                            {c.logs?.length > 0 && <span className="text-xs text-slate-400 font-medium mt-0.5">{c.logs.length} interactions</span>}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Hash className="w-4 h-4 opacity-50" />
                            <span className="text-sm font-medium">{c.source || 'Direct'}</span>
                        </div>
                      </td>
                       <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 text-slate-400">
                           {/* Quick Call */}
                           <a 
                             href={`tel:${c.phone}`} 
                             onClick={(e) => e.stopPropagation()}
                             className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                             title="Direct Call"
                           >
                              <Phone className="w-4 h-4" />
                           </a>
                           {/* Quick WhatsApp */}
                           <a 
                             href={getWhatsAppLink(c.phone, getSmartMessage(c))}
                             target="_blank" rel="noopener noreferrer"
                             onClick={(e) => e.stopPropagation()}
                             className="p-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
                             title="WhatsApp Message"
                           >
                              <MessageCircle className="w-4 h-4" />
                           </a>
                           {/* Open Profile */}
                           <button 
                             onClick={(e) => { e.stopPropagation(); onSelectClient(c.id); }}
                             className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors shadow-sm"
                             title="Open Profile"
                           >
                              <ChevronRight className="w-4 h-4" />
                           </button>
                           {/* Delete Client */}
                           <button 
                             onClick={(e) => { e.stopPropagation(); onDeleteClient && onDeleteClient(c.id); }}
                             className="p-2.5 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-lg transition-colors shadow-sm ml-1"
                             title="Delete Client"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center">
                       <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-slate-400" />
                          </div>
                          <div className="text-lg font-bold text-slate-700">No leads found</div>
                          <p className="text-slate-500 max-w-xs mx-auto text-sm">Add your first lead or adjust your search to see contacts here.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 h-[calc(100vh-140px)] hide-scrollbar items-start">
          {BOARD_COLUMNS.map(col => {
            const columnClients = visibleClients.filter(c => {
              if (col.id === 'new') {
                 return !c.status || col.statuses.includes(c.status);
              }
              return col.statuses.includes(c.status);
            });
            
            return (
              <div 
                key={col.id}
                className="flex-shrink-0 w-80 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl p-4 flex flex-col border border-slate-200/50 dark:border-slate-800 h-full max-h-full"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm tracking-wide uppercase">{col.title}</h3>
                  <span className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
                     {columnClients.length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-10">
                  {columnClients.map(c => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, c.id)}
                      onClick={() => onSelectClient(c.id)}
                      className="bg-white dark:bg-slate-900/80 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all group"
                    >
                      <div className="font-bold text-slate-800 dark:text-white text-sm mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {c.companyName || c.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center justify-between">
                         <span className="truncate max-w-[120px]">{c.companyName ? c.name : c.phone}</span>
                         {c.industry && <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">{c.industry}</span>}
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                        <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                           {c.lastContacted ? new Date(c.lastContacted).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'New'}
                        </div>
                        <div className="flex gap-1 text-slate-400">
                           <button 
                             onClick={(e) => { e.stopPropagation(); onDeleteClient && onDeleteClient(c.id); }}
                             className="p-1.5 hover:bg-rose-50 rounded-md hover:text-rose-600 transition-colors mr-1"
                             title="Delete"
                           >
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                           <a 
                              href={`tel:${c.phone}`} 
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 bg-slate-50 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"
                           >
                              <Phone className="w-3.5 h-3.5" />
                           </a>
                           <a 
                              href={getWhatsAppLink(c.phone, getSmartMessage(c))} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-200 rounded-md text-emerald-600 transition-colors"
                           >
                              <MessageCircle className="w-3.5 h-3.5" />
                           </a>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {columnClients.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest p-4 text-center mt-2">
                      Drop Here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientList;
