import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const sections = [
    {
      title: "COMPANY STATS",
      items: [
        { label: "GLOBAL NETWORK", sub: "5+ Locations Active", status: "bg-emerald-500" },
        { label: "SUPPORT CENTER", sub: "24/7/365 Online", status: "bg-emerald-500" },
        { label: "CUSTOMER RATING", sub: "4.9/5 TrustScore", status: "bg-emerald-500" },
      ],
    },
    {
      title: "ABOUT & SUPPORT",
      items: [
        { label: "About Us", sub: "Our history, infrastructure, and team.", icon: "ℹ️" },
        { label: "Contact Us", sub: "Get in touch with our experts 24/7.", icon: "✉️" },
        { label: "Affiliates Program", sub: "Earn up to 40% commission per sale.", icon: "👥" },
      ],
    },
    {
      title: "LEGAL & TRUST",
      items: [
        { label: "Privacy Policy", sub: "How we secure and process data.", icon: "🛡️" },
        { label: "Terms & Conditions", sub: "Terms of service for our hosting services.", icon: "📄" },
        { label: "Refund Policy", sub: "Our refund policies and guarantees.", icon: "🔄" },
      ],
    },
  ];

  return (
    <footer className="bg-slate-50 border-t py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-bold text-slate-400 tracking-widest mb-8">{section.title}</h3>
            <div className="space-y-6">
              {section.items.map((item) => (
                <div key={item.label} className="flex gap-4 group cursor-pointer">
                  {item.status ? (
                    <div className="pt-1">
                      <div className={`w-2 h-2 rounded-full ${item.status}`} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center text-lg group-hover:border-primary transition-colors">
                      {item.icon}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{item.label}</h4>
                    <p className="text-slate-500 text-xs mt-1">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Partner with us</h3>
          <p className="text-slate-500 text-sm mb-6">Refer clients and start generating passive income with our referral bonuses.</p>
          
          <ul className="space-y-3 mb-8">
            {['High Conversions', 'Monthly Payouts', 'Dedicated Support'].map((feat) => (
              <li key={feat} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-500" />
                </div>
                {feat}
              </li>
            ))}
          </ul>

          <Button className="w-full bg-[#5831f7] hover:bg-[#4828d9] text-white py-6 rounded-xl">
            Join Program →
          </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
        <p>© 2026 HostPro Solutions. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-primary">Status</Link>
          <Link to="/" className="hover:text-primary">Knowledgebase</Link>
          <Link to="/" className="hover:text-primary">API Docs</Link>
        </div>
      </div>
    </footer>
  );
}
