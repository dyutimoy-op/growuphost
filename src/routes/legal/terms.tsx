import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  FileText,
  Scale,
  Clock,
  AlertTriangle,
  Ban,
  Wallet,
  Globe,
  Database,
  RotateCcw,
  ShieldAlert,
  Server,
  Users,
  Fingerprint,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { buildPageHead } from "@/lib/seo/head";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { WHMCS_LINKS } from "@/config/whmcs";

const PATH = "/legal/terms";
const LAST_UPDATED_DISPLAY = "26th-June-2025";
const LAST_UPDATED_ISO = "2025-06-26";

export const Route = createFileRoute("/legal/terms")({
  component: TermsPage,
  head: () =>
    buildPageHead({
      title: "Terms & Conditions | GROWUPHOST",
      description:
        "Official GrowupHost Terms & Conditions governing termination, backups, domain registration, acceptable use, refund policies, and account verification.",
      path: PATH,
      twitterCard: "summary",
      jsonLd: [
        webPageJsonLd({
          name: "Terms & Conditions",
          description:
            "Official GrowupHost contractual terms governing hosting, servers, domains, acceptable use, and support.",
          path: PATH,
          dateModified: LAST_UPDATED_ISO,
        }),
        breadcrumbJsonLd([{ name: "Terms & Conditions", path: PATH }]),
      ],
    }),
});

const PROHIBITED_ITEMS: readonly string[] = [
  "Don't Provide Free Hosting (For Reseller Users)",
  "High Traffic News Website & E Commerce Website Not Allow",
  "Spam/Threats Website",
  "Phishing Website",
  "Email Marketing",
  "IRC Scripts/Bots",
  "Proxy Scripts/Anonymizers",
  "Pirated Software/Warez",
  "Image Hosting Scripts (similar to Photobucket or Tinypic)",
  "Large collection of MP3, MP4 files and/or DVD/CD ISO Image Files, and movies.",
  "Prime Banks Programs",
  "Lottery Sites",
  "Forums and/or websites that distribute warez/pirated/illegal content",
  "Fraudulent Sites (Including, but not limited to sites listed at aa419.org & escrow-fraud.com)",
  "Adult Site (Porn Sites)",
  "Push button mail scripts",
  "Bitcoin Mining",
  ".tk, .ml, .cf, .ga domain hosting not allowed if someone found, we will termiante service without any prior notive",
  "Hacker focused sites/archives/programs",
  "Commercial Audio Streaming (more than one or two streams)",
  "CRC, UCL, Mitra UIDAI, or anytype of Print Portal Website strictly prohibited",
];

export function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white transition-colors duration-200">
      <Navbar />
      <main id="main-content" className="flex-grow pt-56 sm:pt-64 lg:pt-72 pb-20">
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="space-y-6 mb-12 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-black tracking-widest uppercase shadow-sm">
              <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Legal Center &amp; Policies
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-tight">
              Terms &amp;{" "}
              <span className="text-blue-600 dark:text-blue-400 italic">Conditions</span>
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-wider shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                Last Update On {LAST_UPDATED_DISPLAY}
              </span>
              <a
                href="#updateSection"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Click here to check changelogs
              </a>
            </div>

            <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
              Please read these terms and conditions carefully before using GrowupHost services.
              These terms apply to all visitors, users, and clients.
            </p>
          </div>

          <div className="space-y-8">
            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-600/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  1): Termination:
                </h2>
              </div>

              <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border-l-4 border-l-red-500 border border-red-200/60 dark:border-red-900/40 space-y-3">
                <p className="text-sm sm:text-base leading-relaxed font-semibold text-slate-900 dark:text-slate-200">
                  Hosting which expires and doesn&apos;t renew within{" "}
                  <strong className="text-red-600 dark:text-red-400 font-black">10 days</strong>{" "}
                  from its expiry date and{" "}
                  <strong className="text-red-600 dark:text-red-400 font-black">
                    VPS Server within 48 hours and Dedicated Server within 72 hours
                  </strong>{" "}
                  will be terminated completely. Deleted data can&apos;t be restorable in this case
                  and either through mail or call client will be informed.
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  GrowupHost will not be responsible if client doesn&apos;t able to check mail or
                  recieve call regarding renewal.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border-l-4 border-l-amber-500 border border-amber-200/60 dark:border-amber-900/30 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-sm font-black text-amber-900 dark:text-amber-300">
                  All prices can be reviewed at GrowupHost.com at any time
                </span>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border-l-4 border-l-blue-500 border border-blue-200/60 dark:border-blue-900/30">
                  <h3 className="text-sm sm:text-base font-black text-slate-950 dark:text-white">
                    The following content is prohibited on our servers (No Refund and Data Recovery
                    Possible If We Found Following Content In Website)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                  {PROHIBITED_ITEMS.map((item, idx) => (
                    <div
                      key={item}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
                    >
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-black text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-950 dark:text-white">
                    Shared Hosting Purpose:{" "}
                  </strong>
                  All shared hosting plans are for web hosting purpose. We do not allow hosting of
                  download files like mp3, wallpaper download site, movies downloading/streaming
                  site or bot site under our hosting. All such sites will be{" "}
                  <strong className="text-red-600 dark:text-red-400 uppercase font-black">
                    Suspended
                  </strong>{" "}
                  by our server team without any prior notice.
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  2): Fund or Credit Balance:
                </h2>
              </div>

              <div className="space-y-3 text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                  <strong>1.&nbsp;</strong>No Refund after fund added to{" "}
                  <strong className="text-slate-950 dark:text-white">GrowupHost</strong> wallet
                  (Credit Balance).
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                  <strong>2.&nbsp;</strong>Fund provided into{" "}
                  <strong className="text-slate-950 dark:text-white">GrowupHost</strong> wallet is
                  non refundable.
                </div>
                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-l-blue-500 border border-blue-200/60 dark:border-blue-900/30 space-y-2">
                  <p>
                    <strong>3.&nbsp;</strong>From 14-February-2022, if you buy hosting from the
                    credit balance and later ask for a refund, then you will get a refund into
                    credit balance not in the main account like bank UPI or any supported payment
                    gateway. Please read these terms and conditions before adding funds to the
                    credit balance. Even after this, if any customer asks for a refund, then it will
                    be considered against our terms.
                  </p>
                  <span className="inline-block text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Updated on 14-Feb-2022
                  </span>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  3): Domains Registration
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                <p>
                  Customer can not buy any domain in which trademark name of other company/name/etc
                  is registered... Once the domain is registered it can&apos;t be canceled or
                  refunded.
                </p>
                <p>
                  It is a responsibility of the client to verify the domain registration is
                  successful or not, rarely under unfortunate circumstances, domain registration may
                  not happen due to software error or network error or any other unknown technical
                  reasons. If there is any issue in domain registration, client should get back to
                  GrowupHost within{" "}
                  <strong className="text-slate-950 dark:text-white font-black">
                    7 working days
                  </strong>
                  . The client should update the support team by writing Email to{" "}
                  <a
                    href="mailto:support@GrowupHost.com"
                    className="text-blue-600 dark:text-blue-400 font-black hover:underline"
                  >
                    support@GrowupHost.com
                  </a>{" "}
                  to rectify the problem.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  GrowupHost accepts no liability for the loss of any domain that has failed to
                  register due to an invalid/insufficient information provided to us, late payments
                  received or technical faults which are beyond our control.
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-cyan-50 dark:bg-cyan-600/20 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  4): Backups &amp; Recovery
                </h2>
              </div>

              <div className="space-y-3.5 text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                  <strong>1. </strong>Free Backup is complimentory service. We don&apos;t charge for
                  it, and data backup is fully automated. We can only able to provide your data if
                  backup available into our storage server.
                </div>
                <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border-l-4 border-l-red-500 border border-red-200/60 dark:border-red-900/30">
                  <strong className="text-red-600 dark:text-red-400">2. </strong>Accounts larger
                  than{" "}
                  <strong className="text-red-600 dark:text-red-400 font-black">
                    20GB WILL NOT
                  </strong>{" "}
                  be included in backups.
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                  <strong>3. </strong>GrowupHost is not responsible for files and/or data residing
                  on your account. You agree to take full responsibility for all files and data
                  transferred and to maintain all appropriate backup of files and data stored on
                  GrowupHost&apos;s servers.
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500 border border-emerald-200/60 dark:border-emerald-900/30">
                  <strong>4. </strong>Backup rotation time is daily its will be stored on a separate
                  storage server, ensuring that you have access to backups for the past three days.
                  This means you can retrieve backups dating back up to three days from the current
                  date, even in the event of sudden server failure, shutdown, or data center
                  closure. There will be no extra charge for this service. However, if your service
                  is suspended or terminated due to a violation of terms, we reserve the right to
                  withhold access to this data and remove it from the server.
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-600/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  5): Reactivation Fee
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                <p className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border-l-4 border-l-amber-500 border border-amber-200/60 dark:border-amber-900/30 font-semibold text-slate-900 dark:text-slate-200">
                  In case your server/service is suspended due to any kind of malware or phishing or
                  prohibited content then a reactivation fee of{" "}
                  <strong className="text-amber-700 dark:text-amber-400 font-black">
                    ₹1000/₹500 INR
                  </strong>{" "}
                  respectively. There will be no rebate on this so do not request for rebate.
                </p>
                <p>
                  We will temporarily suspend the user&apos;s account for a period of two days.
                  Before reactivating the account, the user must remove any abusive content; failure
                  to do so will result in a permanent account suspension.
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-red-50 dark:bg-red-600/20 border border-red-200 dark:border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  <Ban className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  6): Adult Content Policy:
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                <p className="font-bold text-red-600 dark:text-red-400">
                  We do not allow adult content such as pornography or nudity. Zero Tolerance Spam
                  Policy.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                  <strong>1.&nbsp;</strong>We take a zero tolerance stance against sending of
                  unsolicited e-mail, bulk emailing, and spam. “Safe lists” and “double opt-in” will
                  be treated as spam. Any user who sends out spam will have their account terminated
                  with or without notice. No refunds will be given.
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                  <strong>2.&nbsp;</strong>Mailing Policy and Limits: Sending Bulk mails are not
                  allowed on our server, Per cPanel account can send{" "}
                  <strong className="text-slate-950 dark:text-white font-black">500 Mails</strong>.
                  If any accounts seems to be spamming it will be suspended with or without any
                  notice(Only for shared &amp; reseller hosting).
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  7): WHMCS:
                </h2>
              </div>
              <p className="text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                With All Reseller, Master Reseller and Alpha Reseller Plan We Give You Softaculous
                Installed WHMCS (No Key, Not Verify, Only Install)
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  8): Affiliates Program:
                </h2>
              </div>

              <ul className="space-y-2.5 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-300">
                {[
                  "Account with Referrals involving fraud, abuse, or any misconduct will not be paid.",
                  "Account must be active at least 60 days for paid.",
                  "Referral which request refund for any reason will not be paid.",
                  "Currently Affiliate Commision only available with GrowupHost All Hosting Plans.",
                  "No bulk e-mail traffic, no fraud redirects, or other malicious advertising like coupon, discount code will not accepted.",
                  "Affiliate accounts which are in violation of any rule or are abusing the affiliate program in any way, will be terminated with no prior notice.",
                  "We reserve the right to cancel or modify this affiliate program at any time and for any reason.",
                ].map((item, idx) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5"
                  >
                    <span className="font-black text-purple-600 dark:text-purple-400 shrink-0">
                      {idx + 1}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article
              id="updateSection"
              className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-5 scroll-mt-28"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-red-50 dark:bg-red-600/20 border border-red-200 dark:border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight leading-snug">
                  9): DDoS, Infected Files, Viruses, Other Destructive Activities or Shell Backdoor:
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                  <strong className="text-slate-950 dark:text-white">1. </strong>Use of
                  GrowupHost.com’s services or equipment for creating or sending Internet viruses,
                  worms, or Trojan horses, or for pinging, flooding, or mail bombing, or engaging in
                  denial of service attacks is prohibited.
                </div>

                <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border-l-4 border-l-red-500 border border-red-200/60 dark:border-red-900/30">
                  <strong className="text-red-600 dark:text-red-400 font-black">
                    2. CPGuard:{" "}
                  </strong>
                  CPGuard plugin is a plugin that suspends the service when more than{" "}
                  <strong className="text-red-600 dark:text-red-400 font-black">
                    10 infected files
                  </strong>{" "}
                  are found, after cleaning it again if infected files are found they will suspend
                  it, If the same thing is repeated again, the plugin will terminate its file from
                  the server, and we will not be responsible for it, Also, if a client is found
                  doing a DDoS or accessing unauthenticated with the help of a shell backdoor, the
                  same action will be taken against him.
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-600/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  10): Misslead{" "}
                  <span className="text-blue-600 dark:text-blue-400 italic">Updated</span>
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                  <strong className="text-slate-950 dark:text-white font-black">(A): </strong>If a
                  customer provides incorrect details such as email, phone number, or address, their
                  account will be closed and will not be reopened until accurate information is
                  submitted.
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                  <strong className="text-slate-950 dark:text-white font-black">(B): </strong>
                  According to the provided information, users are not allowed to create multiple
                  accounts on the platform, and if anyone attempts to do so, the additional accounts
                  will be promptly closed. The system have various methods to detect duplicate
                  accounts, including tracking IP addresses, user activity logs, and GEO locations.
                  These measures ensure that each person can only have one account, promoting
                  fairness and preventing misuse of the platform. Maintaining a single account per
                  user helps in upholding the platform&apos;s policies and creates a level playing
                  field for all users.
                </div>

                <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/30 border-l-4 border-l-red-500 border border-red-200/60 dark:border-red-900/30">
                  <strong className="text-red-600 dark:text-red-400 font-black">
                    (C): Device Lock:{" "}
                  </strong>
                  If a user repeatedly violates our policies and continues to provide false
                  information, we consider that the user is not willing to improve. In such cases,
                  we reserve the right to lock the user&apos;s device.{" "}
                  <strong className="text-red-700 dark:text-red-300">
                    ( Device lock means the user will no longer be able to access GrowupHost
                    services or the billing panel from that device. If the user attempts to bypass
                    the restriction using third-party tools or any workaround, the system will
                    automatically impose a permanent ban. )
                  </strong>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 space-y-2">
                  <p>
                    <strong className="text-slate-950 dark:text-white font-black">(D) (1) </strong>
                    If a user violates our terms as stated in <strong>Paragraph 1, 6, 9, 12</strong>{" "}
                    — whether intentionally or by mistake — while purchasing hosting, they will be
                    forgiven once and issued a refund as per our <strong>Refund Policy</strong>.
                  </p>
                  <p>
                    <strong className="text-slate-950 dark:text-white font-black">(D) (2) </strong>
                    However, if the user repeats the same violation, their account will be
                    terminated under <strong>Paragraph 1 (Termination)</strong>, and in accordance
                    with <strong>Paragraph 10(C)</strong>, their account and device may be
                    permanently banned to prevent any further access to our website or services.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 space-y-2">
                  <p>
                    <strong className="text-slate-950 dark:text-white font-black">(E): </strong>If a
                    client engages in <strong>abusive</strong>, <strong>disrespectful</strong>, or{" "}
                    <strong>inappropriate behavior</strong> towards support staff via any
                    communication medium, including but not limited to <em>phone calls</em>,{" "}
                    <em>support tickets</em>, <em>live chat</em>, or <em>emails</em> — especially in
                    situations where <strong>no legitimate issue exists</strong> —{" "}
                    <strong>GrowupHost reserves the right</strong> to take{" "}
                    <strong>disciplinary action</strong>. This may include{" "}
                    <strong>temporary suspension</strong> of the client’s account and/or a{" "}
                    <strong>device-level ban</strong> as per <strong>Clause 10(C)</strong> of our{" "}
                    <em>Terms of Service</em>.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    We are committed to providing <strong>professional</strong> and{" "}
                    <strong>courteous support</strong> to all clients and expect the same level of{" "}
                    <strong>respect</strong> in return.{" "}
                    <strong>Repeated or severe violations</strong> may lead to{" "}
                    <strong>permanent restrictions</strong>.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  11): SMM Panels
                </h2>
              </div>
              <p className="text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                If any customer takes hosting for SMM Panel then he has to take Plesk hosting for
                SMM, you can BUY SMM hosting from here , Even after this, if any user is found
                running the panel on GrowupHost Server, his account will be terminated without
                informing.
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-600/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  12): Software/WebPanel/API Change
                </h2>
              </div>
              <p className="text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                We don’t allow freenom domains on our hosting. If you still place an order with the
                freenom domain and use it for spamming purposes. Your account will be suspended
                immediately and no refunds will be done.
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-600/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  13): Unlimited Hosting Plans
                </h2>
              </div>
              <p className="text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                Unlimited Hosting does not mean that every resource in the server is provided
                unlimited. As this hosting package is a shared hosting package, the resources in the
                server will be shared between sites. Hence, you cannot use unlimited disk space, ram
                or processor usage. If your sites usage is found to impact other sites you will be
                requested to move to the dedicated VPS packages.
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-600/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight leading-snug">
                  14): OTP Verification using WhatsApp
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                    User Verification
                  </h3>
                  <p>
                    Users, whether new or existing, are required to undergo a one-time verification
                    process to establish their authenticity and legitimacy. This verification aims
                    to enhance user transparency and trustworthiness, providing a secure environment
                    for all users.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                    Emergency Contact and Abuse Reporting
                  </h3>
                  <p>
                    The verified user details may be used in case of emergencies or to address abuse
                    reports promptly. This process allows us to maintain a safe and secure
                    community, ensuring swift action when needed.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                    Direct User Connection
                  </h3>
                  <p>
                    Upon successful OTP verification, users will be directly connected to our
                    platform, fostering a direct and trustworthy relationship. This direct
                    connection aims to streamline communication and enhance the overall user
                    experience.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                    Data Security
                  </h3>
                  <p>
                    We prioritize the security of user data and assure you that all provided
                    information is handled with the utmost confidentiality. User details obtained
                    during OTP verification will not be shared with any third parties and will be
                    used exclusively for the intended purposes outlined in our privacy policy.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                    User Consent
                  </h3>
                  <p>
                    Users willingly provide their consent to undergo OTP verification, understanding
                    its importance in maintaining a secure and genuine user community. By opting for
                    this verification process, users acknowledge and agree to comply with our terms
                    and conditions.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                    Non-Transferability
                  </h3>
                  <p>
                    Verified user details are strictly non-transferable and should only be used for
                    the intended purposes within our platform. Sharing or using verified information
                    for unauthorized activities may lead to account suspension or other appropriate
                    actions.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                    Compliance with Laws
                  </h3>
                  <p>
                    Users must comply with all applicable laws and regulations during the OTP
                    verification process and while using our services.
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                    Modification of Terms
                  </h3>
                  <p>
                    We reserve the right to modify these terms and conditions at any time. Users
                    will be notified of any changes, and continued use of our services implies
                    acceptance of the updated terms.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-900/40 text-red-700 dark:text-red-300 font-bold">
                  By undergoing OTP verification on WhatsApp, you affirm your understanding and
                  acceptance of these terms and conditions. Please read them carefully before
                  proceeding.
                </div>

                <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                    One Person, One Phone Number, One Account
                  </h3>
                  <p className="text-sm sm:text-base">
                    Our policy strictly enforces one account per individual, each verified with a
                    unique phone number. Users are prohibited from creating multiple accounts with
                    the same number, requiring either additional numbers or account merging.
                    Violation may result in penalties, including account suspension, due to
                    potential affiliate violations and security risks.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  15): Client Identity
                </h2>
              </div>
              <p className="text-sm sm:text-base leading-relaxed font-medium text-slate-800 dark:text-slate-300">
                When procuring VPS, dedicated servers, or RDP access, clients must complete a
                verification process by submitting their national ID, passport, or driver&apos;s
                license for authentication. This ensures compliance with security protocols and
                regulatory standards, bolstering overall server security and preventing unauthorized
                access. The provided identification documents are rigorously reviewed to confirm the
                client&apos;s identity and establish trustworthiness. Failure to comply with
                verification requirements may result in delays or rejection of the server purchase
                request, prioritizing security and client confidentiality.
              </p>
            </article>

            <article
              id="warnTOS"
              className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 sm:p-9 shadow-lg backdrop-blur-xl space-y-6"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-600/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  16): Warning Level Protocol
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-300">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <h3 className="text-base font-black text-slate-950 dark:text-white">
                    Warning Levels
                  </h3>
                  <p className="text-sm">
                    Users may receive up to three warnings for repeated violations such as excessive
                    messaging on the same topic on{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                      WhatsApp
                    </strong>
                    , disappearing during support, or inappropriate behavior.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <h3 className="text-base font-black text-slate-950 dark:text-white">
                    Consequences
                  </h3>
                  <p className="text-sm">
                    After three warnings, users will be banned from WhatsApp and call support,
                    necessitating the use of ticket or email support.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <h3 className="text-base font-black text-slate-950 dark:text-white">
                    Support Channels
                  </h3>
                  <p className="text-sm">
                    Users must await responses through ticket or email support after being banned
                    from WhatsApp or call services.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 space-y-1.5">
                  <h3 className="text-base font-black text-slate-950 dark:text-white">
                    Compliance
                  </h3>
                  <p className="text-sm">
                    Users agree to comply with the warning system; failure to do so may result in
                    further disciplinary actions.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <strong>Modification: </strong>These terms are subject to change; users will be
                notified accordingly.
              </p>
            </article>

            <div className="p-6 sm:p-8 rounded-3xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wider">
                  Have questions regarding our terms?
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  Our 24/7/365 support team is ready to assist you.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" asChild className="rounded-xl font-bold text-xs">
                  <Link to="/legal/privacy">Privacy Policy</Link>
                </Button>
                <Button variant="outline" asChild className="rounded-xl font-bold text-xs">
                  <Link to="/legal/sla">SLA Guarantee</Link>
                </Button>
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  <a href={WHMCS_LINKS.support} target="_blank" rel="noopener noreferrer">
                    Open Ticket <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Button({
  children,
  className = "",
  asChild,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  variant?: "default" | "outline";
}) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 transition-all cursor-pointer " +
    (variant === "outline"
      ? "border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
      : "bg-blue-600 text-white hover:bg-blue-500") +
    " " +
    className;

  if (asChild) {
    return <span className={base}>{children}</span>;
  }

  return <button className={base}>{children}</button>;
}
