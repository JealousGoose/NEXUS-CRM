import React, { useState, useMemo, useRef } from 'react';
import { 
  Users, PhoneCall, Calendar, Search, Plus, Download, BarChart3, Clock, MessageSquare, Menu, X, Upload, CheckCircle2, XCircle, LogOut
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientProfile from './components/ClientProfile';
import AddClientModal from './components/AddClientModal';
import CallScript from './components/CallScript';
import AuthPage from './components/AuthPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
import { parseCSV } from './utils';
import './styles/auth.css';

const TABS = {
  DASHBOARD: 'Dashboard',
  MEETINGS: 'Meetings',
  FOLLOW_UPS: 'Follow Ups',
  INTERESTED: 'Interested',
  NOT_INTERESTED: 'Not Interested',
  CLIENTS: 'All Contacts',
  SCRIPT: 'Call Script'
};

function App() {
  // ── All hooks must be called unconditionally at the top ──
  const { user, isLoading, signup, login, logout } = useAuth();
  const [clients, setClients] = useLocalStorage('crm_clients', []);
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  const handleAddClient = (newClient) => {
    const client = {
      ...newClient,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      logs: [],
      createdAt: new Date().toISOString()
    };
    setClients([...clients, client]);
    setShowAddModal(false);
    setSelectedClientId(client.id);
    setActiveTab(TABS.CLIENTS);
  };

  const handleUpdateClient = (updatedClient) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleAddLog = (clientId, logEntry) => {
    setClients(clients.map(c => {
      if (c.id === clientId) {
        const newLog = {
          ...logEntry,
          id: Date.now().toString(36) + Math.random().toString(36).substring(2),
          date: new Date().toISOString()
        };
        return {
          ...c,
          logs: [newLog, ...c.logs],
          lastContacted: newLog.date,
          status: logEntry.status,
          followUpDate: logEntry.followUpDate || c.followUpDate,
          meetingDate: logEntry.meetingDate || c.meetingDate
        };
      }
      return c;
    }));
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Phone,Status,Source,DateAdded\n"
      + clients.map(c => `${c.name},${c.phone},${c.status},${c.source},${c.createdAt.split('T')[0]}`).join("\n");
    
    // Create blob instead of direct data URI for reliable downloading
    const blob = new Blob([csvContent.replace('data:text/csv;charset=utf-8,', '')], { type: 'text/csv' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `crm_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      const newClients = parseCSV(csvText);
      if (newClients.length > 0) {
        setClients(prev => [...prev, ...newClients]);
        alert(`Successfully imported ${newClients.length} leads!`);
      } else {
        alert("Could not find valid phone numbers in the CSV.");
      }
      e.target.value = null; // reset
    };
    reader.readAsText(file);
  };

  const upcomingFollowUps = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return clients.filter(c => c.followUpDate && c.followUpDate >= today)
      .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
  }, [clients]);

  const todayMeetings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return clients.filter(c => c.meetingDate && c.meetingDate.startsWith(today))
      .sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate));
  }, [clients]);

  // Base Lists
  const meetingClients = useMemo(() => clients.filter(c => c.status === 'Meeting Booked'), [clients]);
  const followUpClients = useMemo(() => clients.filter(c => c.status === 'Follow up tomorrow' || c.status === 'Follow up later'), [clients]);
  const interestedClients = useMemo(() => clients.filter(c => c.status === 'Interested'), [clients]);
  const notInterestedClients = useMemo(() => clients.filter(c => c.status === 'Not interested'), [clients]);

  // Global Search Filter
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const lowerSearch = searchTerm.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(lowerSearch) ||
      c.phone.includes(lowerSearch) ||
      (c.source && c.source.toLowerCase().includes(lowerSearch)) ||
      (c.status && c.status.toLowerCase().includes(lowerSearch))
    );
  }, [clients, searchTerm]);

  const displayClients = useMemo(() => {
    switch (activeTab) {
      case TABS.MEETINGS: return meetingClients;
      case TABS.FOLLOW_UPS: return followUpClients;
      case TABS.INTERESTED: return interestedClients;
      case TABS.NOT_INTERESTED: return notInterestedClients;
      default: return filteredClients;
    }
  }, [activeTab, filteredClients, meetingClients, followUpClients, interestedClients, notInterestedClients]);

  const displayTitle = useMemo(() => {
    switch (activeTab) {
      case TABS.MEETINGS: return 'Meetings';
      case TABS.FOLLOW_UPS: return 'Follow Ups';
      case TABS.INTERESTED: return 'Interested Leads';
      case TABS.NOT_INTERESTED: return 'Not Interested';
      default: return searchTerm ? `Search Results (${filteredClients.length})` : "All Contacts";
    }
  }, [activeTab, searchTerm, filteredClients.length]);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  // ── Conditional rendering AFTER all hooks ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <span className="text-slate-400 font-medium text-sm">Loading NEXUS...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={login} onSignup={signup} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Mobile Header / Search */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-40 px-4 py-3 flex items-center justify-between shadow-lg">
         <span className="font-bold tracking-tight text-lg">NEXUS.</span>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-800 rounded-lg">
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
         </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 flex flex-col will-change-transform shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:block border-b border-slate-800 space-y-4">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="text-emerald-400 w-6 h-6" />
            NEXUS.
          </h1>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Instant Search leads..." 
               className="w-full bg-slate-800 text-white pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
               value={searchTerm}
               onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (activeTab === TABS.DASHBOARD || activeTab === TABS.SCRIPT) {
                     setActiveTab(TABS.CLIENTS);
                     setSelectedClientId(null);
                  }
               }}
             />
          </div>
        </div>

        <div className="md:hidden p-4 mt-14">
           {/* Mobile Search */}
           <div className="relative mb-4">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search leads..." 
               className="w-full bg-slate-800 text-white pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none"
               value={searchTerm}
               onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setActiveTab(TABS.CLIENTS);
                  setSelectedClientId(null);
               }}
             />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-6 space-y-2">
            <div className="px-4 mb-2 text-xs font-bold text-slate-500 tracking-widest uppercase">Main Menu</div>
            {[
              { id: TABS.DASHBOARD, icon: BarChart3, label: 'Dashboard' },
              { id: TABS.CLIENTS, icon: Users, label: 'All Contacts', badge: clients.length },
              { id: TABS.SCRIPT, icon: MessageSquare, label: 'Call Script' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedClientId(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  activeTab === tab.id && !selectedClientId
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </div>
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id && !selectedClientId ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="px-4 mb-2 text-xs font-bold text-slate-500 tracking-widest uppercase">Pipeline</div>
            {[
              { id: TABS.MEETINGS, icon: Calendar, label: 'Meetings', badge: meetingClients.length },
              { id: TABS.FOLLOW_UPS, icon: Clock, label: 'Follow-ups', badge: followUpClients.length },
              { id: TABS.INTERESTED, icon: CheckCircle2, label: 'Interested', badge: interestedClients.length },
              { id: TABS.NOT_INTERESTED, icon: XCircle, label: 'Not Interested', badge: notInterestedClients.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedClientId(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  activeTab === tab.id && !selectedClientId
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </div>
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id && !selectedClientId ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          {/* User profile bar */}
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
              {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user.fullName}</div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button 
              onClick={exportData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Import CS
            </button>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={importData} 
            />
          </div>
          <button 
            onClick={() => { setShowAddModal(true); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 px-4 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add New Lead
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:pt-0 pt-16 h-full overflow-hidden bg-white/50 relative">
        {/* Dynamic Background subtle grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNFMkU4RjAiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
        
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar relative z-10 px-4 py-8 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === TABS.DASHBOARD && !selectedClientId && (
              <Dashboard 
                clients={clients} 
                upcomingFollowUps={upcomingFollowUps}
                todayMeetings={todayMeetings}
                onSelectClient={(id) => {
                  setSelectedClientId(id);
                  setActiveTab(TABS.CLIENTS);
                }}
                onFilterView={(statusFilter) => {
                  switch(statusFilter) {
                    case 'Interested': setActiveTab(TABS.INTERESTED); break;
                    case 'Follow up': setActiveTab(TABS.FOLLOW_UPS); break;
                    case 'Not interested': setActiveTab(TABS.NOT_INTERESTED); break;
                    default: setActiveTab(TABS.CLIENTS); break;
                  }
                  setSearchTerm('');
                  setSelectedClientId(null);
                }}
              />
            )}

            {[TABS.CLIENTS, TABS.MEETINGS, TABS.FOLLOW_UPS, TABS.INTERESTED, TABS.NOT_INTERESTED].includes(activeTab) && !selectedClientId && (
              <ClientList 
                clients={displayClients} 
                onSelectClient={setSelectedClientId}
                onUpdateClient={handleUpdateClient}
                title={displayTitle}
              />
            )}

            {selectedClientId && selectedClient && (
              <ClientProfile 
                client={selectedClient}
                onBack={() => setSelectedClientId(null)}
                onAddLog={(log) => handleAddLog(selectedClientId, log)}
                onUpdateClient={handleUpdateClient}
              />
            )}

            {activeTab === TABS.SCRIPT && !selectedClientId && (
              <CallScript />
            )}
          </div>
        </div>
      </main>

      {/* Add Client Floating Action Button on Mobile */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-700 transition-colors z-40 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAddModal && (
        <AddClientModal 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddClient}
        />
      )}
    </div>
  );
}

export default App;
