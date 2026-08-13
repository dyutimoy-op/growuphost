import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-black tracking-widest uppercase">
                  <MessageSquare className="w-3 h-3" /> Get In Touch
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                  HOW CAN WE <br />
                  <span className="text-indigo-500 italic">HELP?</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-xl leading-relaxed font-medium">
                  Have a question about our services or need technical assistance? Our team is standing by to assist you.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { icon: Mail, label: "Email Us", val: "support@growuphost.com" },
                  { icon: Phone, label: "Call Us", val: "+1 (888) 123-4567" },
                  { icon: MessageSquare, label: "Live Chat", val: "Available 24/7" },
                  { icon: MapPin, label: "Headquarters", val: "Mumbai, India" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400">
                       <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{item.label}</div>
                      <div className="text-white font-bold">{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 p-10 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
               <form className="space-y-6 relative z-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-slate-500">Full Name</label>
                     <Input className="bg-white/5 border-white/10 text-white rounded-xl py-6 focus:border-indigo-500 transition-colors" placeholder="John Doe" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-slate-500">Email Address</label>
                     <Input className="bg-white/5 border-white/10 text-white rounded-xl py-6 focus:border-indigo-500 transition-colors" placeholder="john@example.com" />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-slate-500">Subject</label>
                   <Input className="bg-white/5 border-white/10 text-white rounded-xl py-6 focus:border-indigo-500 transition-colors" placeholder="Sales Inquiry" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-slate-500">Message</label>
                   <Textarea className="bg-white/5 border-white/10 text-white rounded-xl min-h-[150px] focus:border-indigo-500 transition-colors" placeholder="Tell us about your project..." />
                 </div>
                 <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-8 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg transition-all hover:scale-[1.01]">
                   Send Message
                 </Button>
               </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}