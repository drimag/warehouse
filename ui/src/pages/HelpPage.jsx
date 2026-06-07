import React, { useState } from 'react';

export const HelpPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  const handlePrint = () => {
    // Force reset filters so the entire handbook prints sequentially
    setActiveTab('all');
    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased font-sans print:bg-white print:text-black print:block print:h-auto print:min-h-0 print:overflow-visible">
      
      {/* 1. LEFT NAVIGATION SIDEBAR - Hidden completely on print */}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 sticky top-0 h-screen overflow-y-auto print:hidden">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          WMS User Manual
        </h2>
        <ul className="space-y-1">
          <li 
            className={`px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all ${
              activeTab === 'all' 
                ? 'bg-slate-100 text-slate-900 font-medium' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('all')}
          >
            📋 Complete Manual (Print Mode)
          </li>
          <li 
            className={`px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all ${
              activeTab === 'inbound' 
                ? 'bg-slate-100 text-slate-900 font-medium' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('inbound')}
          >
            📥 Inbound Logistics
          </li>
          <li 
            className={`px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all ${
              activeTab === 'outbound' 
                ? 'bg-slate-100 text-slate-900 font-medium' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('outbound')}
          >
            📤 Outbound Logistics
          </li>
          <li 
            className={`px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all ${
              activeTab === 'trouble' 
                ? 'bg-slate-100 text-slate-900 font-medium' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('trouble')}
          >
            ⚠️ Troubleshooting
          </li>
        </ul>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="flex-1 py-10 px-14 max-w-4xl mx-auto print:max-w-full print:p-0 print:m-0">
        
        {/* TOP BAR ACTIONS - Hidden on print */}
        <header className="flex justify-between items-center border-b border-slate-200 pb-4 mb-8 print:hidden">
          <div>
            <h1 className="text-xl font-bold text-slate-900">System Support Portal</h1>
            <p className="text-sm text-slate-500">Select a topic or export the handbook for physical clipboard use.</p>
          </div>
          <button 
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2 shadow-sm transition-colors"
            onClick={handlePrint}
          >
            &#x1F5A8;&#xFE0F; Export Handbook PDF
          </button>
        </header>

        {/* DOCUMENT BODY */}
        <div className="space-y-12 print:space-y-0">
          
          {/* MODULE 1: INBOUND LOGISTICS */}
          {(activeTab === 'all' || activeTab === 'inbound') && (
            <section className="print-block print:break-before-page first:print:break-before-avoid print:pb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4 print:text-2xl">
                Module 1: Inbound Logistics (Receiving)
              </h1>
              <p className="text-slate-600 leading-relaxed mb-6 print:text-black">
                This section outlines operations for receiving incoming transit stock and processing structural manifests.
              </p>
              
              <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3 border-b border-slate-100 pb-2 print:text-lg print:border-black">
                1.1 Executing the Unload Sequence
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4 print:text-black">
                When a delivery vehicle arrives on the receiving platform, open your handheld scanner and point it at the incoming vehicle manifest barcode.
              </p>
              
              {/* TABLE - Prevent row slicing with print:break-inside-avoid */}
              <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm my-6 print:shadow-none print:border-black print:break-inside-avoid">
                <table className="w-full border-collapse text-left text-sm text-slate-600 print:text-black">
                  <thead className="bg-slate-50 border-b border-slate-200 print:bg-slate-100 print:border-black">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-700 print:text-black">Initial Status</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 print:text-black">Required Scan Target</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 print:text-black">Target Status</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 print:text-black">Manifest Event Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 print:divide-black">
                    <tr>
                      <td className="px-4 py-3"><code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs print:bg-none print:p-0">IN_TRANSIT</code></td>
                      <td className="px-4 py-3">Incoming Waybill ID</td>
                      <td className="px-4 py-3"><code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs print:bg-none print:p-0">UNLOADING</code></td>
                      <td className="px-4 py-3 font-medium text-slate-900 print:text-black">ARRIVAL Manifest Created</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* MODULE 2: OUTBOUND LOGISTICS */}
          {(activeTab === 'all' || activeTab === 'outbound') && (
            <section className="print-block print:break-before-page print:pb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4 print:text-2xl">
                Module 2: Outbound Logistics (Dispatch)
              </h1>
              <p className="text-slate-600 leading-relaxed mb-6 print:text-black">
                This section handles organizing freight configurations, managing waybills, and finalizing unit assignments for outgoing linehauls.
              </p>
              
              <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3 border-b border-slate-100 pb-2 print:text-lg print:border-black">
                2.1 Initializing the Loading Phase
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4 print:text-black">
                Before any physical unit passes onto the vehicle container layout, scan the primary Waybill sheet. This transitions the state tracking window from planning into active operations.
              </p>
              
              {/* WARNING BOX - print:break-inside-avoid prevents it cutting over page seam */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg my-6 print:bg-slate-50 print:border-black print:border print:rounded-lg print:break-inside-avoid">
                <p className="text-sm text-amber-800 print:text-black">
                  <strong className="font-semibold">💡 Operational Note:</strong> If a vehicle remains parked without receiving an updated barcode scan for more than <strong className="font-semibold">15 continuous minutes</strong>, the session heartbeat terminates, and the platform frees the truck back to the assignment queue.
                </p>
              </div>
            </section>
          )}

          {/* MODULE 3: TROUBLESHOOTING */}
          {(activeTab === 'all' || activeTab === 'trouble') && (
            <section className="print-block print:break-before-page print:pb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4 print:text-2xl">
                Module 3: Error Resolution & Hardware Exceptions
              </h1>
              <p className="text-slate-600 leading-relaxed mb-6 print:text-black">
                Follow these lookup routines if the handheld scanning device displays error screens or emits an audio rejection alert.
              </p>
              
              <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3 border-b border-slate-100 pb-2 print:text-lg print:border-black">
                3.1 Duplication and Match Check Failures
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4 print:text-black">
                The core scanning route uses unique composite checking to verify inputs against historical database schemas using physical dimensions.
              </p>
              
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg my-6 print:bg-slate-50 print:border-black print:border print:rounded-lg print:break-inside-avoid">
                <p className="text-sm text-red-800 font-medium mb-1 print:text-black">🔴 Error Prompt: "Barcodes Do Not Match"</p>
                <p className="text-xs text-red-700 leading-relaxed print:text-black">
                  This occurs when the secondary verification scan fails to map directly to the initial input. The screen will display a red input prompt. Clear debris from the chassis rating stamp, scan the secondary target, and proceed.
                </p>
              </div>

              <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3 border-b border-slate-100 pb-2 print:text-lg print:border-black">
                3.2 Engine vs. Frame Matching Logic
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4 print:text-black">
                The systemic database pipelines read strings uniformly. You are cleared to query either structural asset stamp:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 print:text-black print:break-inside-avoid">
                <li><strong className="font-semibold text-slate-800 print:text-black">Engine Number Label:</strong> Primary index tracking fallback configuration.</li>
                <li><strong className="font-semibold text-slate-800 print:text-black">Frame Number Plate:</strong> Secondary architectural mapping track data layer.</li>
              </ul>
            </section>
          )}

        </div>
      </main>
    </div>
  );
};