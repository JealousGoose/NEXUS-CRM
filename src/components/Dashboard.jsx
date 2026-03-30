import React, { useMemo } from 'react';
import { 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ChevronRight,
  Activity,
  Calendar,
  Star,
  MessageCircle,
  Phone,
  Target,
  BarChart3
} from 'lucide-react';
import { getWhatsAppLink, getSmartMessage } from '../utils';

const Dashboard = ({ clients, upcomingFollowUps, todayMeetings = [], onSelectClient, onFilterView }) => {
  const interested = clients.filter(c => c.status === 'Interested').length;
  const notInterested = clients.filter(c => c.status === 'Not interested').length;
  const followUps = clients.filter(c => c.status === 'Follow up tomorrow' || c.status === 'Follow up later').length;

  // Daily Achievement Engine
  const dailyStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let calls = 0;
    let newLeads = 0;
    let newInterested = 0;

    clients.forEach(c => {
      // Check if added today
      if (c.createdAt && c.createdAt.startsWith(today)) {
        newLeads++;
        if (c.status === 'Interested') newInterested++;
      }
      // Check interaction logs today
      (c.logs || []).forEach(log => {
        if (log.timestamp && log.timestamp.startsWith(today)) calls++;
      });
    });

    return { callsMade: calls, newLeads, newInterested };
  }, [clients]);

  const activityData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const shortDate = d.toLocaleDateString(undefined, { weekday: 'short' });
      
      const leadsAdded = clients.filter(c => c.createdAt && c.createdAt.startsWith(dateStr)).length;
      
      let interactions = 0;
      clients.forEach(c => {
         interactions += (c.logs || []).filter(l => l.timestamp && l.timestamp.startsWith(dateStr)).length;
         if (c.status === 'Meeting Booked' && c.meetingDate && c.meetingDate.startsWith(dateStr)) interactions++;
      });

      data.push({ day: shortDate, leads: leadsAdded, interactions });
    }
    return data;
  }, [clients]);

  const maxActivity = Math.max(...activityData.map(d => Math.max(d.leads, d.interactions, 1)));

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Sleek Header & Mission */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-4 px-2 md:px-0">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Here is what's happening today.</p>
        </div>
        
        {/* Minimalist Daily Mission */}
        <div className="flex items-center justify-between md:justify-end gap-6 bg-white dark:bg-slate-900 py-3 px-6 rounded-2xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-slate-800">
           <div className="flex gap-4 items-center">
              <div>
                 <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">Target</div>
                 <div className="font-bold text-slate-800 dark:text-white text-sm">{dailyStats.callsMade} / 15</div>
              </div>
              <div className="hidden sm:block w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-400 dark:bg-emerald-500 transition-all rounded-full" style={{ width: `${Math.min(100, (dailyStats.callsMade / 15) * 100)}%` }} />
              </div>
           </div>
           <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
           <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">Hot Leads</div>
              <div className="font-bold text-emerald-500 text-sm flex items-center gap-1">
                 <Target className="w-3.5 h-3.5" /> {dailyStats.newInterested}
              </div>
           </div>
        </div>
      </div>

      {/* Ultra Minimalist Pipeline Stats Row */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_-5px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          {[
            { label: 'Total Contacts', value: clients.length, color: 'text-indigo-600 dark:text-indigo-400', filter: 'All' },
            { label: 'Hot Leads', value: interested, color: 'text-emerald-500', filter: 'Interested' },
            { label: 'Follow Ups', value: followUps, color: 'text-amber-500', filter: 'Follow up' },
            { label: 'Passed', value: notInterested, color: 'text-slate-400 dark:text-slate-500', filter: 'Not interested' },
          ].map((stat, i) => (
            <button 
              key={i} 
              onClick={() => onFilterView && onFilterView(stat.filter)}
              className="p-6 md:p-8 flex flex-col items-center md:items-start text-center md:text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div className={`text-3xl font-black ${stat.color} mb-1 group-hover:scale-105 transition-transform`}>{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Activity Chart (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_-5px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
               <Activity className="w-4 h-4 text-emerald-500" /> Activity Trend
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700"></div> Leads</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500"></div> Interactions</div>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 overflow-hidden">
            {activityData.map((data, i) => (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end gap-3 group">
                <div className="flex justify-center gap-1.5 w-full items-end flex-1">
                   <div className="relative w-1/3 max-w-[12px] bg-slate-50 dark:bg-slate-800/50 rounded-t-sm overflow-hidden flex items-end h-full">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 transition-all duration-1000 group-hover:bg-slate-300 dark:group-hover:bg-slate-600" style={{ height: `${(data.leads / maxActivity) * 100}%`, minHeight: data.leads > 0 ? '4px' : '0' }} />
                   </div>
                   <div className="relative w-1/3 max-w-[12px] bg-slate-50 dark:bg-slate-800/50 rounded-t-sm overflow-hidden flex items-end h-full">
                      <div className="w-full bg-emerald-400 dark:bg-emerald-500 transition-all duration-1000 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400" style={{ height: `${(data.interactions / maxActivity) * 100}%`, minHeight: data.interactions > 0 ? '4px' : '0' }} />
                   </div>
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{data.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Action Column */}
        <div className="flex flex-col gap-6">
           
           {/* Meetings */}
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_-5px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex-1">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                   <Clock className="w-4 h-4 text-indigo-500" /> Meetings
                </h3>
             </div>
             <div className="space-y-4">
               {todayMeetings.length > 0 ? todayMeetings.slice(0, 4).map(c => (
                 <div key={c.id} className="group flex items-center justify-between cursor-pointer" onClick={() => onSelectClient(c.id)}>
                   <div>
                     <div className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{c.name}</div>
                     <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{new Date(c.meetingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                 </div>
               )) : <div className="text-sm font-medium text-slate-400 dark:text-slate-600 py-4">No meetings today.</div>}
             </div>
           </div>

           {/* Follow Ups */}
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_-5px_rgba(0,0,0,0.03)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex-1">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                   <Calendar className="w-4 h-4 text-amber-500" /> Follow Ups
                </h3>
             </div>
             <div className="space-y-4">
               {upcomingFollowUps.length > 0 ? upcomingFollowUps.slice(0, 4).map(c => (
                 <div key={c.id} className="group flex items-center justify-between cursor-pointer" onClick={() => onSelectClient(c.id)}>
                   <div>
                     <div className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-amber-600 transition-colors">{c.name}</div>
                     <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{c.phone}</div>
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-400 transition-colors" />
                 </div>
               )) : <div className="text-sm font-medium text-slate-400 dark:text-slate-600 py-4">Inbox Zero.</div>}
             </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
