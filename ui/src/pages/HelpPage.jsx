import React, { useState } from "react";

export const HelpPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const handlePrint = () => {
    setActiveTab("all");
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
              activeTab === "all"
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("all")}
          >
            📋 Complete Manual
          </li>
          <li
            className={`px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all ${
              activeTab === "viewing"
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("viewing")}
          >
            📥 Viewing Data
          </li>
          <li
            className={`px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all ${
              activeTab === "scanning"
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("scanning")}
          >
            ⛶ Scanning
          </li>
          <li
            className={`px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all ${
              activeTab === "bulk"
                ? "bg-slate-100 text-slate-900 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("bulk")}
          >
            📤 Bulk Uploads
          </li>
        </ul>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="flex-1 py-10 px-14 max-w-4xl mx-auto print:max-w-full print:p-0 print:m-0">
        {/* TOP BAR ACTIONS - Hidden on print */}
        <header className="flex justify-between items-center border-b border-slate-200 pb-4 mb-8 print:hidden">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              System Support Portal
            </h1>
            <p className="text-sm text-slate-500">
              Select a topic or export the handbook for physical clipboard use.
            </p>
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
          {/* MODULE 1: Viewing */}
          {(activeTab === "all" || activeTab === "viewing") && (
            <section className="print-block print:break-before-page first:print:break-before-avoid print:pb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4 print:text-2xl">
                Module 1: Viewing Data (Units & Waybills)
              </h1>
              <p className="text-slate-600 leading-relaxed mb-6 print:text-black">
                This section covers navigating, and searching through database
                records.
              </p>

              {/* SECTION 1.1 */}
              <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-3 border-b border-slate-100 pb-2 print:text-lg print:border-black">
                1.1 Comprehensive Records
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4 print:text-black">
                Navigate to the unit and waybill tables through their respective
                icons on the sidebar. These should display a comprehensive
                collection for each type of data.
              </p>
              {/* 📸 IMAGE BLOCK */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center print:border-black print:break-inside-avoid">
                <img
                  src="../../public/units_table.png" // Replace with your actual image path or URL
                  alt="Dropdown Selection and Scanning Workflow Reference Diagram"
                  className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm max-h-64 object-contain print:shadow-none print:border-black"
                />
                <span className="text-[10px] text-slate-400 mt-1.5 italic print:text-black">
                  Figure 1.1: Units Table.
                </span>
              </div>

              {/* 📸 IMAGE BLOCK */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center print:border-black print:break-inside-avoid">
                <img
                  src="../../public/waybills_table.png" // Replace with your actual image path or URL
                  alt="Dropdown Selection and Scanning Workflow Reference Diagram"
                  className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm max-h-64 object-contain print:shadow-none print:border-black"
                />
                <span className="text-[10px] text-slate-400 mt-1.5 italic print:text-black">
                  Figure 1.2: Waybills Table.
                </span>
              </div>

              {/* CRITICAL OPERATIONAL LOGIC WARNINGS */}
              <div className="space-y-4 my-6 print:space-y-4 print:break-inside-avoid">
                <div className="bg-slate-100 border-l-4 border-slate-500 p-4 rounded-r-lg print:bg-slate-50 print:border-black print:border print:rounded-lg">
                  <p className="text-sm text-slate-800 print:text-black">
                    <strong className="font-semibold">
                      📍 Location tracking limitation:
                    </strong>{" "}
                    For units, the
                    <span className="font-medium"> Last Location</span> column
                    will <strong>not</strong> update to display the license
                    plate of the vehicle it is being transported with while
                    having the <code>IN_TRANSIT</code> status.
                  </p>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg print:bg-slate-50 print:border-black print:border print:rounded-lg">
                  <p className="text-sm text-amber-900 print:text-black">
                    <strong className="font-semibold">
                      📊 Quantity Metrics Calculation Breakdown:
                    </strong>
                    <br />
                    Waybill quantities are dynamically calculated from
                    transactional rows matched within the manifest ledger using
                    the following processing rules:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-xs text-amber-800 space-y-1 print:text-black">
                    <li>
                      <strong>Expected Quantity:</strong> Represents the
                      absolute constant sum of all structural units linked to
                      the target manifest ID.
                    </li>
                    <li>
                      <strong>Actual Quantity:</strong> Evaluates conditionally
                      depending entirely on the waybill's live operational
                      lifecycle step:
                      <ul className="list-circle pl-5 mt-1 space-y-1">
                        <li>
                          📌{" "}
                          <em>
                            During <code>LOADING</code> or{" "}
                            <code>IN_TRANSIT</code> phases:
                          </em>{" "}
                          Displays the real-time count of physical units that
                          operators have actively scanned onto the transport
                          manifest.
                        </li>
                        <li>
                          📌{" "}
                          <em>
                            During <code>UNLOADING</code> or{" "}
                            <code>ARRIVED</code> phases:
                          </em>{" "}
                          Shifts to count only the volume of items successfully
                          scanned off the truck as officially checked-in at the
                          terminal destination.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>

              {/* FILTERING AND SEARCH CONTROLS */}
              <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2 print:text-md">
                Search Routing & Filtering Parameters
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 print:text-black">
                Both dashboard modules contain filters for the diplayed data.
              </p>

              <div className="gap-4 my-6 print:grid-cols-1 print:gap-2 print:break-inside-avoid">
                {/* UNIT FILTERS */}
                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-black">
                  <h4 className="font-bold text-sm text-slate-900 mb-2 print:border-b">
                    Dashboard Control
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 print:text-black">
                    <li>
                      <strong>Search Bar:</strong> Takes the literal string
                      input and compares it against{" "}
                      <span className="font-medium">Engine</span> or{" "}
                      <span className="font-medium">Frame</span> for{" "}
                      <code>units</code> and{" "}
                      <span className="font-medium">Waybill ID</span> or{" "}
                      <span className="font-medium">Client</span> for{" "}
                      <code>waybills</code>{" "}
                    </li>
                    <li>
                      <strong>Drop-down Modals:</strong> Allows operational
                      batch isolation filtered strictly by{" "}
                      <span className="font-medium">
                        Last Known Warehouse Location
                      </span>{" "}
                      or system{" "}
                      <span className="font-medium">Asset Status</span> codes.
                    </li>
                  </ul>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3 border-b border-slate-100 pb-2 print:text-lg print:border-black">
                1.2 Viewing Individual Detail Records
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4 print:text-black">
                Specific records for an individual <code>unit</code> or{" "}
                <code>waybill</code> can be done by simply clicking on the row
                of the desired entry.
              </p>

              {/* --- INVENTORY UNIT AUDIT LOGS --- */}
              <div className="mt-6 print:break-inside-avoid">
                <h3 className="text-lg font-bold text-slate-800 mb-2 print:text-md">
                  📦 Unit Logs
                </h3>
                {/* 📸 IMAGE BLOCK */}
                <div className="mb-4 pb-4 border-slate-100 flex flex-col items-center print:border-black print:break-inside-avoid">
                  <img
                    src="../../public/unit_logs.png" // Replace with your actual image path or URL
                    alt="Dropdown Selection and Scanning Workflow Reference Diagram"
                    className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm max-h-64 object-contain print:shadow-none print:border-black"
                  />
                  <span className="text-[10px] text-slate-400 mt-1.5 italic print:text-black">
                    Figure 1.3: Unit Logs.
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4 print:text-black">
                  <strong>Unit Logs</strong> show the lifecycle of a unit from
                  beginning to end.
                </p>

                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-black">
                  <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2 print:text-black">
                    Unit Logs Specifications:
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 print:text-black">
                    <li>
                      <strong>Chronological Sorting:</strong> Logs are sorted
                      from earlist to latest starting from the top.
                    </li>
                    <li>
                      <strong>Current Version Indicator:</strong> A status flag
                      confirms the latest log entry.
                    </li>
                    <li>
                      <strong>Validity Time Windows (Start / End):</strong> Each
                      log has both a{" "}
                      <span className="font-medium">Start Time</span> and{" "}
                      <span className="font-medium">End Time</span> that
                      indicate the range at which that specfic entry was the
                      latest version
                    </li>
                  </ul>
                </div>
              </div>

              {/* --- WAYBILL AUDIT LOGS --- */}
              <div className="mt-8 print:break-inside-avoid">
                <h3 className="text-lg font-bold text-slate-800 mb-2 print:text-md">
                  📋 Waybill Logs
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-3 print:text-black">
                  Similar to <code>units</code>, the{" "}
                  <strong>Waybill Logs</strong> display the complete history of
                  a waybill from start to end.
                </p>

                {/* 📸 IMAGE BLOCK */}
                <div className="mb-4 pb-4 border-slate-100 flex flex-col items-center print:border-black print:break-inside-avoid">
                  <img
                    src="../../public/waybill_logs.png" // Replace with your actual image path or URL
                    alt="Dropdown Selection and Scanning Workflow Reference Diagram"
                    className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm max-h-64 object-contain print:shadow-none print:border-black"
                  />
                  <span className="text-[10px] text-slate-400 mt-1.5 italic print:text-black">
                    Figure 1.4: Waybill Logs.
                  </span>
                </div>

                {/* CARGO STAGE COLUMNS BREAKDOWN */}
                <h4 className="font-bold text-sm text-slate-800 mb-2 print:text-xs">
                  System Manifest Cargo Verification Layouts
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed mb-3 print:text-black">
                  Directly underneath the waybill logs table, there will be
                  tables to detail the units associated with the waybill from
                  advice to departure and arrival.
                </p>
                {/* 📸 IMAGE BLOCK */}
                <div className="mb-4 pb-4 border-slate-100 flex flex-col items-center print:border-black print:break-inside-avoid">
                  <img
                    src="../../public/waybill_logs2.png" // Replace with your actual image path or URL
                    alt="Dropdown Selection and Scanning Workflow Reference Diagram"
                    className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm max-h-64 object-contain print:shadow-none print:border-black"
                  />
                  <span className="text-[10px] text-slate-400 mt-1.5 italic print:text-black">
                    Figure 1.5: Waybill Manifest Logs.
                  </span>
                </div>


              </div>
            </section>
          )}

          {/* MODULE 2: Scanning */}
          {(activeTab === "all" || activeTab === "scanning") && (
            <section className="print-block print:break-before-page print:pb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4 print:text-2xl">
                Module 2: Core Scanning Operations (Inbound & Outbound)
              </h1>
              <p className="text-slate-600 leading-relaxed mb-6 print:text-black">
                This section details the scanning process.
              </p>

              {/* 2.1 INITIALIZATION */}
              <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3 border-b border-slate-100 pb-2 print:text-lg print:border-black">
                2.1 Session Initialization & Manifest Selection
              </h2>

              <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-black mb-6">
                <ul className="text-xs text-slate-600 space-y-3 list-disc pl-4 print:text-black">
                  <li>
                    <strong>The Selection Filter Dropdown:</strong> Select your
                    target waybill from the dropdown menu.
                    {/* 📸 IMAGE BLOCK */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center print:border-black print:break-inside-avoid">
                      <img
                        src="../../public/wb_select.png" // Replace with your actual image path or URL
                        alt="Dropdown Selection and Scanning Workflow Reference Diagram"
                        className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm max-h-64 object-contain print:shadow-none print:border-black"
                      />
                      <span className="text-[10px] text-slate-400 mt-1.5 italic print:text-black">
                        Figure 2.1: Interface reference for Waybill
                        initialization parameters.
                      </span>
                    </div>
                  </li>
                  <li>
                    <strong>Valid Waybills for Scan: </strong> Only waybills
                    with valid statuses will be displayed and can be selected to
                    initiate scanning.
                  </li>
                  <ul className="list-circle pl-5 mt-1 space-y-1">
                    <li>
                      📌 <code>ADVICE</code> Status: Indicates outbound
                      shipments currently staged for origin dock deployment.
                    </li>
                    <li>
                      📌 <code>IN_TRANSIT</code> Status: Indicates inbound
                      shipments currently incoming for destination offloading.
                    </li>
                  </ul>
                  <li>
                    <strong>Missing Waybill:</strong> If the expected waybill
                    does not exist in the database, click the{" "}
                    <span className="font-semibold">Generate New Waybill</span>{" "}
                    button to jump to the waybill creation page generate a new
                    instance.
                  </li>
                  <li>
                    <strong>Data Validation Check:</strong> Upon selecting an
                    ID, details of the selected waybill will be displayed.
                    Double-check against the expected values before proceeding.
                  </li>
                  {/* 📸 IMAGE BLOCK */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center print:border-black print:break-inside-avoid">
                    <img
                      src="../../public/wb_select.png" // Replace with your actual image path or URL
                      alt="Dropdown Selection and Scanning Workflow Reference Diagram"
                      className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm max-h-64 object-contain print:shadow-none print:border-black"
                    />
                    <span className="text-[10px] text-slate-400 mt-1.5 italic print:text-black">
                      Figure 2.2: Selected waybill details.
                    </span>
                  </div>
                  <li>
                    <strong>Photo Upload:</strong> Take a clear picture of the
                    physical units being loaded for documentation.
                  </li>
                  <li>
                    <strong>Proceed to Scanning:</strong> Clicking the{" "}
                    <span className="font-semibold">Proceed to Scanning</span>{" "}
                    button will set the Waybill to a <code>LOADING</code> state.
                    This excludes itself an option for the{" "}
                    <span className="font-semibold">Select Waybill</span>{" "}
                    dropdown. Thus, while the selected waybill is in the{" "}
                    <code>LOADING</code> state, no other users may initiate a
                    scanning session with it.
                  </li>
                </ul>
              </div>

              {/* 2.2 THE SCANNING MENU */}
              <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3 border-b border-slate-100 pb-2 print:text-lg print:border-black">
                2.2 Scanning
              </h2>

              <div className="grid grid-cols-1 gap-6 print:gap-4">
                {/* STEP 1: INPUT */}
                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-black print:break-inside-avoid">
                  <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                    <span className="bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] print:bg-none print:text-black print:border">
                      1
                    </span>
                    Data Capture & Locking
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed print:text-black">
                    Position your scanning gun over the unit's VIN code for
                    engine or frame. You may need to select the entry field if
                    the cursor doesn't already highlight it.
                    {/* 📸 IMAGE BLOCK */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center print:border-black print:break-inside-avoid">
                      <img
                        src="../../public/scan_empty.png" // Replace with your actual image path or URL
                        alt="Dropdown Selection and Scanning Workflow Reference Diagram"
                        className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm max-h-64 object-contain print:shadow-none print:border-black"
                      />
                      <span className="text-[10px] text-slate-400 mt-1.5 italic print:text-black">
                        Figure 2.3: Default Scanning Module.
                      </span>
                    </div>
                    In the event of a damage label or handware malfunction, you
                    may also manually enter the string into the text field.
                    <br />
                    Click the{" "}
                    <strong className="font-semibold text-slate-800 uppercase">
                      "Next Unit"
                    </strong>{" "}
                    button to lock in the scanned value.
                    <br />
                    <span className="font-semibold text-amber-800 print:text-black">
                      ⚠️ Note: Any scanned values not saved through selecting
                      the "Next Unit" will not be counted towards the final
                      count.
                    </span>{" "}
                  </p>
                </div>

                {/* STEP 2: VERIFICATION LOGIC */}
                <div className="border border-slate-200 rounded-xl overflow-hidden print:border-black print:break-inside-avoid">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 print:bg-slate-100 print:border-black">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      🔄 Backend Match & Exception Handling
                    </h3>
                  </div>
                  <div className="p-4 bg-white space-y-4 text-xs text-slate-600 print:text-black">
                    <p>
                      Upon locking a value, the system queries the master
                      database for an existing unit match. The workflow branches
                      based on the result:
                    </p>

                    <div className="grid grid-cols-2 gap-4 print:grid-cols-1 print:gap-4">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg print:bg-white print:border-black">
                        <span className="font-bold text-slate-900 block mb-1">
                          Standard Match Found
                        </span>
                        The unit is successfully identified and will be included
                        in the final count.
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg print:bg-white print:border-black">
                        <span className="font-bold text-amber-900 block mb-1">
                          Exception: No Match Found
                        </span>
                        If the value is not recognized, the{" "}
                        <strong>Double-Scan Rule</strong> activates to prevent
                        data entry errors.
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg print:bg-white print:text-black print:border print:border-black">
                      <h4 className="font-bold text-amber-900 block mb-1 border-b border-slate-700 pb-1 print:border-black">
                        The Double-Scan Rule (New Asset Generation)
                      </h4>
                      <ul className="space-y-2 list-disc pl-4 text-[11px] opacity-90 print:opacity-100">
                        <li>
                          The system will prompt you to scan the{" "}
                          <strong>exact same code</strong> a second time for
                          verification.
                        </li>
                        <li>
                          <strong>Success:</strong> If the second scan matches
                          the first perfectly, the system caches the new value.
                          Once the session is <em>finished</em>, a new unit
                          entry is generated in the database with the{" "}
                          <code className="bg-white/10 px-1 rounded print:bg-none print:font-bold">
                            ENGINE
                          </code>{" "}
                          property set to this scanned string.
                        </li>
                        <li>
                          <strong>Failure:</strong> If the second scan yields a
                          different value, the prompt will repeat. You must scan
                          the same physical item repeatedly until the system
                          records{" "}
                          <strong>two identical consecutive reads</strong>.
                        </li>
                      </ul>
                    </div>
                    {/* 📸 IMAGE BLOCK */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center print:border-black print:break-inside-avoid">
                      <img
                        src="../../public/scan_double.png" // Replace with your actual image path or URL
                        alt="Dropdown Selection and Scanning Workflow Reference Diagram"
                        className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm max-h-64 object-contain print:shadow-none print:border-black"
                      />
                      <span className="text-[10px] text-slate-400 mt-1.5 italic print:text-black">
                        Figure 2.4: Failed Scan.
                      </span>
                    </div>
                  </div>
                </div>

                {/* STEP 3: PROGRESS TRACKING */}
                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-black print:break-inside-avoid">
                  <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                    <span className="bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] print:bg-none print:text-black print:border">
                      2
                    </span>
                    Real-Time Progress Tracking
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 print:text-black">
                    To monitor manifest completion during floor operations,
                    refer to the counter located at the bottom of the scanning
                    interface block.
                  </p>

                  {/* VISUAL REPRESENTATION OF THE COUNTER */}
                  <div className="flex items-center justify-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 print:bg-white print:border-black">
                    <div className="text-center">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1 print:text-black">
                        Manifest Progress
                      </span>
                      <div className="text-2xl font-mono font-bold text-slate-800 print:text-black">
                        [Current Scan Count]{" "}
                        <span className="text-slate-300 print:text-black">
                          /
                        </span>{" "}
                        [Expected Quantity]
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SESSION ACTIONS: CANCEL, FINISH, HEARBEAT */}
              <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2 print:text-md">
                2.3 Session Lifecycle Controls (Cancel, Finish, & Session Drops)
              </h3>

              <div className="space-y-4 print:space-y-4">
                {/* CANCEL */}
                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-black print:break-inside-avoid">
                  <h4 className="font-bold text-sm text-slate-900 mb-1">
                    ❌ Aborting a Session (Cancel)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed print:text-black">
                    Tapping the <strong>Cancel</strong> action button instantly
                    forgets all previous scans. The manifest reverts to its
                    previous state (making it available for selection in the
                    scanning dropdown) and no new unit database records are
                    created.
                  </p>
                </div>

                {/* FINISH & DISCREPANCIES */}
                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-black print:break-inside-avoid">
                  <h4 className="font-bold text-sm text-slate-900 mb-1">
                    🏁 Finalizing Manifests (Finish)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2 print:text-black">
                    Click <strong>Finish</strong> once your physical inventory
                    count is completed.
                    <span className="text-red-600 font-semibold print:text-black">
                      {" "}
                      CRITICAL: You must click "Next Unit" on your final item
                      scan to lock it in before clicking Finish.
                    </span>
                  </p>
                  <ul className="list-disc pl-4 text-xs text-slate-500 space-y-1 print:text-black">
                    <li>
                      <strong>Discrepancy Overrides:</strong> If your current
                      count does not match the expected value of the waybill, a
                      warning will be displayed. To override this and force
                      processing, click <strong>Finish</strong> a second time.
                    </li>
                    <li>
                      <strong>Audit Review Panel:</strong> A post-scan breakdown
                      dashboard will surface displaying all inputs. Fresh items
                      generated via the double-scan exception routine are
                      clearly marked with a trailing{" "}
                      <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px] print:bg-none">
                        (new)
                      </code>{" "}
                      tag.
                    </li>
                    <li>
                      <strong>Commit Transactions:</strong> Click{" "}
                      <strong>Confirm</strong> to write the manifest updates to
                      the database, or click <strong>Cancel</strong> to drop the
                      session data completely.
                    </li>
                  </ul>
                </div>

                {/* 15-MINUTE INACTIVITY COOLDOWN */}
                <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg print:bg-slate-50 print:border-black print:border print:rounded-lg print:break-inside-avoid">
                  <h4 className="font-bold text-sm text-rose-900 mb-1 print:text-black">
                    ⏱️ The 15-Minute Automated Session Heartbeat
                  </h4>
                  <p className="text-xs text-rose-700 leading-relaxed print:text-black">
                    To account for malfunctions, the application maintains a
                    strict <strong>15-minute inactivity tracker</strong>. This
                    timer initializes the exact second you start a scanning
                    session. Every time you successfully lock in an item via the
                    "Next Unit" action, the timer resets back to zero.
                  </p>
                  <p className="text-xs text-rose-700 font-semibold mt-2 print:text-black">
                    If 15 continuous minutes pass without a logged scan, the
                    terminal software automatically drops the session and resets
                    the manifest back to its original state.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* MODULE 3: Bulk Uploads */}
          {(activeTab === "all" || activeTab === "bulk") && (
            <section className="print-block print:break-before-page print:pb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4 print:text-2xl">
                Module 3: Bulk Upload Data Pipelines & Templates
              </h1>
              <p className="text-slate-600 leading-relaxed mb-6 print:text-black">
                This module provides guidelines for the "batch-uploding" page
              </p>

              {/* 3.1 SYSTEM TRANSACTION PROTOCOLS */}
              <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3 border-b border-slate-100 pb-2 print:text-lg print:border-black">
                3.1 General Guidelines
              </h2>

              <div className="space-y-4 my-6 print:space-y-4 print:break-inside-avoid">
                {/* ALL OR NOTHING RULE */}
                <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg print:bg-slate-50 print:border-black print:border print:rounded-lg">
                  <h4 className="font-bold text-sm text-rose-900 mb-1 print:text-black">
                    🛑 "All-or-Nothing" Database Isolation Rule
                  </h4>
                  <p className="text-xs text-rose-700 leading-relaxed print:text-black">
                    To keep your data safe and consistent, each sheet upload is
                    processed as one complete transaction. If{" "}
                    <strong>any</strong> row contains a validation error, the
                    entire upload is cancelled and no changes are saved. The
                    system will show a detailed checklist that identifies each
                    issue, including the affected cell and row, so you can
                    quickly review and fix any problems before trying again.
                  </p>
                </div>

                {/* TEMPLATE REQ & UPDATE LAWS */}
                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-black">
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 print:text-black">
                    <li>
                      <strong>Template Structure Enforcement: </strong>
                      Use the provided sheet templates which are downloadable on
                      the page. Formats that do not match the provided layouts
                      will not be accepted.
                    </li>
                    <li>
                      <strong>Truck, Driver, Location ID References:</strong>{" "}
                      When declaring the{" "}
                      <span className="font-medium">
                        Truck, Driver, Origin,
                      </span>{" "}
                      or <span className="font-medium">Destination</span>{" "}
                      columns, use the exact <strong>ID code</strong> found on
                      the page. Standard names or string titles will fail
                      processing.
                    </li>
                    <li>
                      <strong>Blank Cells on Update:</strong> When updating
                      existing records using the provided template, leaving a
                      cell completely blank would lead to{" "}
                      <strong>no changes</strong> on the corresponsing record in
                      the database.
                    </li>
                  </ul>
                </div>
              </div>

              {/* 3.2 WAYBILL SPECIFICATIONS */}
              <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3 border-b border-slate-100 pb-2 print:text-lg print:border-black">
                3.2 Waybill Batch Upload/Update Guidelines
              </h2>

              <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm bg-white p-4 print:shadow-none print:border-black print:break-inside-avoid">
                {/* ID STRUCT REVEAL */}
                <table className="w-full text-left text-xs text-slate-600 print:text-black">
                  <thead className="bg-slate-50 border-b border-slate-200 print:bg-none print:border-b-2">
                    <tr>
                      <th className="px-2 py-2 font-semibold">Column Target</th>
                      <th className="px-2 py-2 font-semibold">
                        Validation Bounds & Formatting Guidelines
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                    <tr>
                      <td className="px-2 py-2.5 font-semibold font-mono text-slate-900">
                        code
                      </td>
                      <td className="px-2 py-2.5">
                        Acts as the WB ID prefix. Requires a{" "}
                        <strong>2 to 10 character</strong> string containing
                        alphanumeric values only (no spaces or special
                        characters). Field cannot be empty.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-2.5 font-semibold font-mono text-slate-900">
                        status
                      </td>
                      <td className="px-2 py-2.5">
                        <code>
                          ["ADVICE", "IN_TRANSIT", "ARRIVED", "CLOSED"]
                        </code>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-2.5 font-semibold font-mono text-slate-900">
                        expected_quantity
                      </td>
                      <td className="px-2 py-2.5">
                        Values within <strong>0 and 9999</strong>.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-2.5 font-semibold font-mono text-slate-900">
                        expected_arrival
                      </td>
                      <td className="px-2 py-2.5">
                        <span className="block font-medium mb-1">
                          Acceptable string formatting variants include:
                        </span>
                        <ul className="space-y-1 list-circle pl-4 text-[11px] text-slate-500 print:text-black">
                          <li>
                            📆 <strong>ISO 8601 Standard:</strong>{" "}
                          </li>
                          <li>
                            <code>"2026-06-14"</code> or{" "}
                            <code>"2026-06-14T15:30:00Z"</code>
                          </li>
                          <li>
                            📆 <strong>RFC 2822 Structure:</strong>{" "}
                          </li>
                          <li>
                            <code>"14 Jun 2026"</code> or{" "}
                            <code>"Sun, 14 Jun 2026 GMT"</code>
                          </li>
                          <li>
                            📆 <strong>Standard Short Date:</strong>{" "}
                          </li>
                          <li>
                            <code>"06/14/2026"</code> or{" "}
                            <code>"2026/06/14"</code> (Month first standard)
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>{" "}
                <div className="bg-slate-900 text-white p-3 rounded-lg mb-4 print:bg-slate-100 print:text-black print:border">
                  <span className="text-xs uppercase font-mono tracking-widest block opacity-60">
                    Waybill ID Format
                  </span>
                  <span className="text-md font-bold font-mono">
                    [Provided Waybill Prefix/Code]-[Date in YYMMDD]-[Daily WB
                    Count in XXXX]
                  </span>
                  <p className="text-[11px] opacity-80 mt-1 print:opacity-100">
                    Example Output ID: <code>WBCODE-260614-0024</code>
                  </p>
                </div>
              </div>

              {/* 3.3 UNIT SPECIFICATIONS */}
              <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3 border-b border-slate-100 pb-2 print:text-lg print:border-black">
                3.3 Inventory Unit Batch Upload/Update Guidelines
              </h2>

              <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm bg-white p-4 print:shadow-none print:border-black print:break-inside-avoid">
                <table className="w-full text-left text-xs text-slate-600 print:text-black">
                  <thead className="bg-slate-50 border-b border-slate-200 print:bg-none print:border-b-2">
                    <tr>
                      <th className="px-2 py-2 font-semibold w-1/4">
                        Column Target
                      </th>
                      <th className="px-2 py-2 font-semibold w-3/4">
                        Validation Bounds & Formatting Guidelines
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                    <tr>
                      <td className="px-2 py-2.5 font-semibold font-mono text-slate-900">
                        engine, frame
                      </td>
                      <td className="px-2 py-2.5">
                        <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-500 text-[11px] print:text-black">
                          <li>
                            <strong>Cross-Column Guard:</strong> Must{" "}
                            <strong>not</strong> contain the exact same value as
                            the <code>frame</code> column within the same row.
                          </li>
                          <li>
                            <strong>Global Index Intercept:</strong> The value
                            must not already exist in the database under any
                            existing engine or frame index record.
                          </li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-2.5 font-semibold font-mono text-slate-900">
                        status
                      </td>
                      <td className="px-2 py-2.5">
                        <code>["IN_TRANSIT", "IN_STORAGE", "CLOSED"]</code>.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-2.5 font-semibold font-mono text-slate-900">
                        waybill_code
                      </td>
                      <td className="px-2 py-2.5">
                        <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-500 text-[11px] print:text-black">
                          <li>
                            <strong>Full Target Format Required:</strong> Must
                            use the complete, concatenated Waybill ID form
                            (e.g., <code>MNL-260614-0024</code>), containing
                            both the prefix and generated trailing sequence
                            digits.
                          </li>
                          <li>
                            <strong>Waybill Manifest Status:</strong> Generates
                            the appropriate waybill manifest based on the live
                            value of the provided waybill.
                          </li>
                          <li>
                            <strong>Log Integrity:</strong> Shifting an existing
                            unit to a new waybill does <strong>not</strong>{" "}
                            delete old data. The old waybill manifest link is
                            preserved inside the database, with both the old and
                            new versions existing in the database.
                          </li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-2.5 font-semibold font-mono text-slate-900">
                        old_engine
                      </td>
                      <td className="px-2 py-2.5">
                        <span className="font-semibold text-amber-800 print:text-black">
                          ⚠️ Required for Update Sheets Only:
                        </span>{" "}
                        Used to identify the existing unit record you want to
                        update. Enter the currently registered engine number to
                        find the correct record. If you want to change the
                        engine number, enter the new value in the{" "}
                        <strong>
                          <code>new_engine</code>
                        </strong>{" "}
                        field.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};
