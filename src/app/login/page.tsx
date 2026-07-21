"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, ArrowRight, Shield } from "lucide-react";
import Card from "@/components/ui/Card";
import { authenticateOperator } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();

  const [selectedBuilding, setSelectedBuilding] = useState<"Kalyani" | "Yathri">("Kalyani");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authenticateOperator(username.trim(), password, selectedBuilding);
      setIsLoading(false);

      if (!res.isValid) {
        toast.error("Invalid operator credentials for the selected guest house.");
        return;
      }

      const buildingName = selectedBuilding === "Kalyani" ? "Kalyani Guest House" : "Yathri Nivasa";
      const name = res.role === "ADMIN"
        ? (selectedBuilding === "Kalyani" ? "Kalyani Admin" : "Yathri Admin")
        : (selectedBuilding === "Kalyani" ? "Kalyani Reception" : "Yathri Reception");

      // Store context cookies
      document.cookie = `guesthouse_username=${username}; path=/; max-age=86400`;
      document.cookie = `guesthouse_role=${res.role}; path=/; max-age=86400`;
      document.cookie = `guesthouse_building=${buildingName}; path=/; max-age=86400`;
      document.cookie = `guesthouse_name=${name}; path=/; max-age=86400`;

      toast.success(`Welcome back to ${buildingName} stay console!`);
      router.push("/");
    } catch (err) {
      setIsLoading(false);
      toast.error("Authentication failed. Please try again.");
    }
  };

  // Helper shortcut for user verification
  const handleAutoFill = (role: "reception" | "admin") => {
    if (selectedBuilding === "Kalyani") {
      if (role === "reception") {
        setUsername("kalyani_reception");
        setPassword("KalyaniDesk@Rec44");
      } else {
        setUsername("kalyani_admin");
        setPassword("SiddhaKalyani#Ad99");
      }
    } else {
      if (role === "reception") {
        setUsername("yathri_reception");
        setPassword("YathriDesk&Rec33");
      } else {
        setUsername("yathri_admin");
        setPassword("MuttYathri$Ad88");
      }
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat py-12 px-4"
      style={{ backgroundImage: "url('/mutt-bg.jpg')" }}
    >
      {/* Dark blur overlay */}
      <div className="absolute inset-0 bg-dark-brown/70 backdrop-blur-[3px] z-0"></div>

      <div className="relative z-10 w-full max-w-[480px]">
        <Card className="border-t-4 border-t-brand-orange bg-white/95 backdrop-blur-md shadow-2xl p-6 sm:p-8 rounded-2xl flex flex-col">
          
          {/* Swamiji Row (Header of Card) */}
          <div className="flex justify-center gap-5 sm:gap-6 mb-6 pb-5 border-b border-gray-100">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-orange shadow-md bg-white">
                <img 
                  src="/swami-senior.jpg" 
                  className="w-full h-full object-cover object-top scale-110" 
                  alt="Dr. Sri Sri Sri Shivakumara Swamiji" 
                />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-orange shadow-md bg-white">
                <img 
                  src="/swami-current.jpg" 
                  className="w-full h-full object-cover object-top scale-110" 
                  alt="Sri Sri Sri Siddalinga Swamiji" 
                />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-orange shadow-md bg-white">
                <img 
                  src="/swami-assistant.jpg" 
                  className="w-full h-full object-cover object-top scale-110" 
                  alt="Mutt Trustee Swamiji" 
                />
              </div>
            </div>
          </div>

          {/* Building Selector tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setSelectedBuilding("Kalyani");
                setUsername("");
                setPassword("");
              }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer text-center ${
                selectedBuilding === "Kalyani"
                  ? "bg-brand-orange text-white shadow-md font-extrabold"
                  : "text-gray-650 hover:text-dark-brown"
              }`}
            >
              Kalyani Guest House
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedBuilding("Yathri");
                setUsername("");
                setPassword("");
              }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer text-center ${
                selectedBuilding === "Yathri"
                  ? "bg-brand-orange text-white shadow-md font-extrabold"
                  : "text-gray-655 hover:text-dark-brown"
              }`}
            >
              Yathri Nivasa
            </button>
          </div>

          {/* Branding header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-dark-brown tracking-tight">Siddaganga Mata Tumkur</h2>
            <p className="text-xs text-brand-orange font-bold uppercase mt-1 tracking-wider">
              {selectedBuilding === "Kalyani" ? "Kalyani Guest House" : "Yathri Nivasa"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <User size={14} className="text-brand-orange" /> Operator Username
              </label>
              <input
                type="text"
                required
                placeholder="reception_desk"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold shadow-sm w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <Lock size={14} className="text-brand-orange" /> Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-orange text-dark-brown font-semibold shadow-sm w-full"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 mt-2"
            >
              {isLoading ? "Validating Operator..." : "Access Stay Console"}
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Demo credentials shortcuts */}
          <div className="border-t border-gray-150/60 pt-5 mt-5">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-1">
              <Shield size={10} className="text-brand-orange" /> Auto-fill Evaluation Credentials
            </p>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
              <button
                onClick={() => handleAutoFill("reception")}
                className="bg-orange-50/20 hover:bg-orange-50 border border-orange-200/50 text-brand-orange py-2 rounded-xl transition-colors cursor-pointer text-center"
              >
                Reception Desk
              </button>
              <button
                onClick={() => handleAutoFill("admin")}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-2 rounded-xl transition-colors cursor-pointer text-center"
              >
                Office Admin
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
