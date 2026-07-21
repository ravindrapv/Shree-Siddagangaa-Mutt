import { Map, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-4">
      <div className="bg-orange-50/20 border border-orange-100 p-8 rounded-2xl max-w-md w-full text-center shadow-lg animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-brand-orange mx-auto flex items-center justify-center mb-5">
          <Map size={38} />
        </div>
        
        <h2 className="text-xl font-black text-dark-brown">Record Not Found</h2>
        
        <p className="text-xs text-gray-500 font-semibold leading-relaxed mt-2">
          The guest profile, stay booking, or page you are trying to view does not exist or has been removed from the registry.
        </p>

        <div className="flex justify-center mt-6">
          <Link
            href="/"
            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            Go back to Dashboard
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
