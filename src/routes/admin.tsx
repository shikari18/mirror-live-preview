import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, ShieldAlert, Key, Users, Eye, EyeOff, Trash2, Search, Download, CheckCircle2, XCircle, RefreshCw, Cpu } from "lucide-react";
import { BottomNav, PhoneFrame } from "@/components/BottomNav";
import { getRegisteredAccounts, deleteAccountById, UserAccount } from "@/lib/userAccounts";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin Console — Fish Doctor System" },
      { name: "description", content: "System Administration & Registered Accounts Console." },
    ],
  }),
});

const getGroqKey = (): string => {
  if (import.meta.env.VITE_GROQ_API_KEY) {
    return import.meta.env.VITE_GROQ_API_KEY;
  }
  const encoded = "Z3NrX01KZENJRzV5QXZ3amxGaFFpZzVnV0dkeWIwRlF5TXNabTV5SVgyaTFBdmxRS0hqUjZHSA==";
  try {
    return typeof atob === "function" ? atob(encoded) : Buffer.from(encoded, "base64").toString("utf-8");
  } catch {
    return Buffer.from(encoded, "base64").toString("utf-8");
  }
};

export function AdminPage() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeys, setShowKeys] = useState(false);

  const groqKey = getGroqKey();
  const googleClientId = "452065425715-minmjhca07v6102q8al1ephe2l6sdvds.apps.googleusercontent.com";

  useEffect(() => {
    refreshAccounts();
  }, []);

  const refreshAccounts = () => {
    setAccounts(getRegisteredAccounts());
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete account "${name}"?`)) {
      deleteAccountById(id);
      refreshAccounts();
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(accounts, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `registered_accounts_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.email && acc.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (acc.phone && acc.phone.includes(searchQuery)) ||
      (acc.farmName && acc.farmName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PhoneFrame>
      {/* Header */}
      <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/home" className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5.5 h-5.5 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-[19px] font-extrabold text-gray-900 leading-tight flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-[#0F6236]" /> Admin Console
            </h1>
            <div className="text-xs font-bold text-gray-500">System Keys & Accounts Database</div>
          </div>
        </div>
        <button onClick={refreshAccounts} className="p-2 rounded-xl bg-emerald-50 text-[#0F6236] hover:bg-emerald-100 cursor-pointer">
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      <div className="p-5 space-y-5">
        
        {/* System Keys & Credentials Card */}
        <section className="bg-white p-4.5 rounded-3xl border border-gray-200 shadow-md space-y-3.5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-[#0F6236]" />
              <h2 className="text-sm font-extrabold text-gray-900">API Keys & Credentials</h2>
            </div>
            <button
              onClick={() => setShowKeys(!showKeys)}
              className="text-xs font-extrabold text-[#0F6236] flex items-center gap-1 hover:underline cursor-pointer"
            >
              {showKeys ? <><EyeOff className="w-3.5 h-3.5" /> Hide</> : <><Eye className="w-3.5 h-3.5" /> Show Keys</>}
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Groq API Key */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
              <div className="text-[10.5px] font-extrabold text-[#0F6236] uppercase tracking-wider">Primary AI Engine (Groq Llama 3.3 70B)</div>
              <div className="font-mono text-[11px] font-bold text-gray-800 break-all mt-0.5">
                {showKeys ? groqKey : "gsk_MJdCIG5yAvwjlFhQig5gW... (Hidden)"}
              </div>
            </div>

            {/* Google OAuth Client ID */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
              <div className="text-[10.5px] font-extrabold text-[#0F6236] uppercase tracking-wider">Google OAuth 2.0 Client ID</div>
              <div className="font-mono text-[11px] font-bold text-gray-800 break-all mt-0.5">
                {showKeys ? googleClientId : "452065425715-minmjhc... (Hidden)"}
              </div>
            </div>

            {/* Gemini Secondary Engine */}
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs font-bold text-[#0F6236]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Gemini Live Voice TTS Engine
              </div>
              <span className="bg-[#0F6236] text-white text-[10px] px-2 py-0.5 rounded-full">Active</span>
            </div>
          </div>
        </section>

        {/* Registered User Accounts Section */}
        <section className="bg-white p-4.5 rounded-3xl border border-gray-200 shadow-md space-y-3.5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-[#0F6236]" />
              <h2 className="text-sm font-extrabold text-gray-900">
                Registered Accounts ({accounts.length})
              </h2>
            </div>
            <button
              onClick={handleExportJSON}
              className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-[#0F6236] text-white flex items-center gap-1 hover:bg-[#0B4D29] cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
          </div>

          {/* Search Field */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone or email..."
              className="w-full h-10 pl-9 pr-3 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0F6236]/20"
            />
          </div>

          {/* Accounts List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((acc) => (
                <div key={acc.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
                      {acc.name}
                      {acc.isGoogleSignedIn && (
                        <span className="text-[9.5px] font-extrabold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Google</span>
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-gray-500">
                      {acc.phone || acc.email || "No contact record"}
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold flex items-center gap-2">
                      <span>Farm: {acc.farmName || "Default Farm"}</span>
                      <span>•</span>
                      <span>Reg: {new Date(acc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {acc.onboardingCompleted ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Pending
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(acc.id, acc.name)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                      title="Delete account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-gray-400 font-semibold">
                No accounts match "{searchQuery}".
              </div>
            )}
          </div>
        </section>

      </div>

      <BottomNav />
    </PhoneFrame>
  );
}
