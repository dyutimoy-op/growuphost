import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    title: "Contact GROWUPHOST | 24/7 Enterprise Infrastructure Support",
    meta: [
      { name: "description", content: "Get in touch with the GROWUPHOST enterprise support team. Available 24/7 for sales, technical support, and infrastructure consulting." },
      { property: "og:title", content: "Contact GROWUPHOST | 24/7 Enterprise Support" },
      { property: "og:description", content: "Get in touch with our infrastructure experts. Available 24/7 for your business." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: "https://growuphost.com/contact" },
    ],
  }),
});

function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30 selection:text-indigo-400">
      <Toaster position="top-center" richColors />
      <Navbar />
      <main className="flex-grow">
        <div className="pt-20 bg-slate-950 px-8">
           <div className="max-w-7xl mx-auto py-20 text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">Get in <span className="text-indigo-500">Touch</span></h1>
              <p className="text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
                Have questions about our infrastructure? Our enterprise support team is available 24/7/365 to assist you.
              </p>
           </div>
        </div>

        <section className="py-20 px-8 bg-slate-950">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-3xl font-black text-white tracking-tighter">Contact Information</h2>
                  <p className="text-slate-400 text-lg">Use the details below or fill out the form to reach our sales and support teams.</p>
               </div>

               <div className="space-y-8">
                  <div className="flex items-start gap-6 group">
                     <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500 transition-all group-hover:scale-110">
                        <Mail className="w-6 h-6 text-indigo-400 group-hover:text-white" />
                     </div>
                     <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Email Support</div>
                        <div className="text-xl font-bold text-white">support@growuphost.com</div>
                     </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                     <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500 transition-all group-hover:scale-110">
                        <Phone className="w-6 h-6 text-indigo-400 group-hover:text-white" />
                     </div>
                     <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Direct Sales</div>
                        <div className="text-xl font-bold text-white">+1 (555) 000-GROW</div>
                     </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                     <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500 transition-all group-hover:scale-110">
                        <MapPin className="w-6 h-6 text-indigo-400 group-hover:text-white" />
                     </div>
                     <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Headquarters</div>
                        <div className="text-xl font-bold text-white leading-relaxed">Tech Hub East, <br />Mumbai, MH 400001</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all" />
               <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                        <Input className="bg-white/5 border-white/10 rounded-2xl py-6 focus:border-indigo-500 transition-all" placeholder="John Doe" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                        <Input className="bg-white/5 border-white/10 rounded-2xl py-6 focus:border-indigo-500 transition-all" placeholder="john@example.com" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                     <Input className="bg-white/5 border-white/10 rounded-2xl py-6 focus:border-indigo-500 transition-all" placeholder="Pre-sales question" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Message</label>
                     <Textarea className="bg-white/5 border-white/10 rounded-3xl min-h-[150px] focus:border-indigo-500 transition-all" placeholder="How can we help you?" />
                  </div>
                  <Button className="w-full py-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] shadow-xl shadow-indigo-600/20">
                     Send Message <Send className="ml-2 w-4 h-4" />
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
