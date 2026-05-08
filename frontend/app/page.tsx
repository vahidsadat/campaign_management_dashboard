"use client";
import { useEffect, useState } from "react";

interface Campaign {
  id: string;
  campaign_name : string;
  client : string;
  country_code : string;
  daily_budget : number
  bid : number;
  status : 'active' | 'paused';
  thumbnail : string;
  platform : 'ios' | 'android';
}

interface FilterState {
  countries: string; 
  platform: string; 
  status: string;     
  search: string;      
}

const INITIAL_FILTERS: FilterState = {
  countries: "all",
  platform: "all",
  status: "all",
  search: "",
};

interface ClientStats {
  client: string; //Client name
  total_budget: number | string;
  average_bid: number | string;
  count: number;
}
export default function CampaignPage(){
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total : number; active: number; paused: number} | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clientStats, setClientStats] = useState<ClientStats[]>([]);


  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';


  useEffect(() => {
  const fetchStats = async () => {
    const res = await fetch(`${API_URL}/campaigns/stats`);
    const data = await res.json();
    setClientStats(data);
  };
  fetchStats();
}, [campaigns]);
  const resetFilters = () =>{
    setFilters(INITIAL_FILTERS);
  };
  const deleteCampaign = async (id:string) => {
    if(!confirm("Are you sure?")) return;
    await fetch(`${API_URL}/campaigns/${id}`, {method:'DELETE'});
    setCampaigns(prev=>prev.filter(c=>c.id !== id));
  }
  const updateCampaign = async (id: string, updatedFields : Partial<Campaign>) => {
    try {
      const responce = await fetch(`${API_URL}/campaigns/${id}`,{
        method : "PATCH",
        headers : { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (responce.ok) {
        setCampaigns((perv) => 
        perv.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)));
      }
    } catch(err){
      console.error("Update failed: ", err)
    } finally {
      setEditingId(null)
    }
  };
  //Fetch data from Backend
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const responce = await fetch(`${API_URL}/campaigns`);
        const data = await responce.json();
        console.log("Frontend received:", data);
        setCampaigns(data);
      } catch(err){
        console.error("Failed to load campaigns: ",err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);
  useEffect (() => {
    fetch(`${API_URL}/campaigns/stats`)
    .then(res => res.json())
    .then(data => setStats(data))
  })
  const resetCampaign = async () => {
    if (window.confirm("This will delete all changes and reset to seed data. Countinue?")){
      try {
          const response = await fetch(`${API_URL}/campaigns/reset`, {
            method: 'POST',
          });
          if(response.ok) {
            window.location.reload();
          }
      } catch (error) {
        console.error ("Reset failed: ", error);
      }
    }
  };
    const filteredCampaigns = campaigns.filter((c) => {
    
          const matchesSearch = c.campaign_name.toLowerCase().includes(filters.search.toLowerCase());

          
          const matchesStatus = filters.status === "all" || c.status === filters.status;

         
          const matchesPlatform = filters.platform === "all" || filters.platform.includes(c.platform);


          const matchesCountry = filters.countries === "all" || filters.countries.includes(c.country_code);


    return matchesSearch && matchesStatus && matchesPlatform && matchesCountry;
  });
 return (
  <div className="p-8 bg-gray-50 min-h-screen">
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Client Performance Summary</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {clientStats.map((stat, index) => (
  <div key={stat.client || index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <span className="font-bold text-gray-800 truncate pr-2">
        {stat.client && stat.client !== "null" ? stat.client : "General Client"}
      </span>
      
      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
        {stat.count} Campaigns
      </span>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mt-2">
      <div>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Total Budget</p>
        <p className="text-sm font-black text-gray-700">${Number(stat.total_budget).toLocaleString()}</p>
      </div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Avg Bid</p>
        <p className="text-sm font-black text-blue-600">${Number(stat.average_bid).toFixed(2)}</p>
      </div>
    </div>
  </div>
))}
  </div>
</div>
      {/* stats*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Campaigns</p>
          <p className="text-3xl font-black text-gray-900">{campaigns.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
          <p className="text-3xl font-black text-green-600">
            {campaigns.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paused</p>
          <p className="text-3xl font-black text-orange-600">
            {campaigns.filter(c => c.status === 'paused').length}
          </p>
        </div>
      </div>

      {/* header and create */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Campaign Management</h1>
        <button 
          onClick={() => alert("Create Modal TBD")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-md flex items-center gap-2"
        >
          <span>+</span> CREATE CAMPAIGN
        </button>
      </div>

      {/* filter */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Search</label>
            <input 
              type="text"
              placeholder="Search name..."
              className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Platform</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm"
              value={filters.platform}
              onChange={(e) => setFilters({...filters, platform: e.target.value})}
            >
              <option value="all">All Platforms</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Country</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm"
              value={filters.countries}
              onChange={(e) => setFilters({...filters, countries: e.target.value})}
            >
              <option value="all">All Countries</option>
              {[...new Set(campaigns.map(c => c.country_code))].sort().map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs font-bold text-red-500 hover:bg-red-50 py-2.5 rounded-lg border border-transparent transition-all"
          >
            RESET FILTERS
          </button>
          
            <button 
          onClick={resetCampaign}
          className="text-[12px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider mr-auto"
        >
          Reset Database
        </button>
        </div>
      </div>

      {/* main table */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase w-16">Media</th>
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase">Campaign Name</th>
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase">Client</th>
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase text-center">Country</th>
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase text-center">OS</th>
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase">Budget</th>
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase">Status</th>
              <th className="p-4 text-[11px] font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((c, index) => (
                  <tr key={`${c.id}-${index}`} className="hover:bg-blue-50/30 transition-colors group">
                  {/* Media */}
                  <td className="p-4">
                  {c.thumbnail ? (
                    <img 
                      src={`${API_URL}/images/${c.thumbnail}`} 
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-sm"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    ) : (
                    <span className="text-[10px] text-gray-400 font-bold">N/A</span>
                  )}
                  </td>

                  {/* Editable Name */}
                  <td className="p-4">
                    {editingId === c.id ? (
                      <input 
                        autoFocus
                        className="border border-blue-400 rounded px-2 py-1 w-full text-sm outline-none"
                        defaultValue={c.campaign_name}
                        onBlur={(e) => updateCampaign(c.id, { campaign_name: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && updateCampaign(c.id, { campaign_name: e.currentTarget.value })}
                      />
                    ) : (
                      <div onClick={() => setEditingId(c.id)} className="font-semibold text-gray-900 cursor-text">
                        {c.campaign_name}
                      </div>
                    )}
                  </td>

                  {/* Editable Client */}
                  <td className="p-4">
                    {editingId === c.id ? (
                      <input 
                        className="border border-blue-400 rounded px-2 py-1 w-full text-sm outline-none"
                        defaultValue={c.client}
                        onBlur={(e) => updateCampaign(c.id, { client: e.target.value })}
                      />
                    ) : (
                      <div onClick={() => setEditingId(c.id)} className="text-gray-500 text-sm cursor-text">
                        {c.client}
                      </div>
                    )}
                  </td>

                  {/* Editable Country Code */}
                  <td className="p-4 text-center">
                    {editingId === c.id ? (
                      <input 
                        className="border border-blue-400 rounded px-2 py-1 w-16 text-center text-sm outline-none uppercase"
                        defaultValue={c.country_code}
                        onBlur={(e) => updateCampaign(c.id, { country_code: e.target.value.toUpperCase() })}
                      />
                    ) : (
                      <div onClick={() => setEditingId(c.id)} className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded cursor-text inline-block">
                        {c.country_code}
                      </div>
                    )}
                  </td>

                  {/* Platform */}
                  <td className="p-4 text-center">
                  <button 
                    onClick={() => updateCampaign(c.id, { 
                      platform: c.platform === 'ios' ? 'android' : 'ios' 
                    })}
                    className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all hover:scale-105 active:scale-95 ${
                      c.platform === 'ios' 
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                    }`}
                    title="Click to toggle Platform"
                  >
                    {c.platform?.toUpperCase() || 'N/A'}
                  </button>
                </td>

                  {/* Editable Budget */}
                  <td className="p-4">
                    {editingId === c.id ? (
                      <input 
                        type="number"
                        className="border border-blue-400 rounded px-2 py-1 w-24 text-sm outline-none"
                        defaultValue={c.daily_budget}
                        onBlur={(e) => updateCampaign(c.id, { daily_budget: Number(e.target.value) })}
                      />
                    ) : (
                      <div onClick={() => setEditingId(c.id)} className="font-bold text-gray-800 cursor-text">
                        ${Number(c.daily_budget).toLocaleString()}
                      </div>
                    )}
                  </td>

                  {/* Status Toggle */}
                  <td className="p-4">
                    <button 
                      onClick={() => updateCampaign(c.id, { status: c.status === 'active' ? 'paused' : 'active' })}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                        c.status === 'active' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {c.status.toUpperCase()}
                    </button>
                  </td>

                  {/* Delete Action */}
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => deleteCampaign(c.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-24 text-center text-gray-400 font-medium">
                  No campaigns found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
  
}
