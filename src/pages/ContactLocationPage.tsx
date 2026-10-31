import React, { useState } from 'react';
import {
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  PhoneCall,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useSchoolData } from '../context/SchoolDataContext';

export const ContactLocationPage: React.FC = () => {
  const { siteConfig, submitContactMessage } = useSchoolData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    await submitContactMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91',
      subject: subject.trim() || 'General Campus Inquiry',
      message: message.trim(),
    });
    setSubmitted(true);
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
  };

  const socialItems = [
    {
      key: 'facebook',
      label: 'Facebook',
      href: siteConfig.socialLinks.facebook,
      enabled: siteConfig.socialLinks.enabled.facebook,
    },
    {
      key: 'instagram',
      label: 'Instagram',
      href: siteConfig.socialLinks.instagram,
      enabled: siteConfig.socialLinks.enabled.instagram,
    },
    {
      key: 'youtube',
      label: 'YouTube',
      href: siteConfig.socialLinks.youtube,
      enabled: siteConfig.socialLinks.enabled.youtube,
    },
    {
      key: 'twitter',
      label: 'X / Twitter',
      href: siteConfig.socialLinks.twitter,
      enabled: siteConfig.socialLinks.enabled.twitter,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: siteConfig.socialLinks.whatsapp,
      enabled: siteConfig.socialLinks.enabled.whatsapp,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      href: siteConfig.socialLinks.linkedin,
      enabled: siteConfig.socialLinks.enabled.linkedin,
    },
  ].filter((s) => s.enabled && s.href);

  return (
    <div className="max-w-7xl mx-auto px-6 py-14 space-y-16">
      {/* Header */}
      <section className="space-y-3 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
          <span>Contact &amp; Campus Location</span>
          <span aria-hidden="true">·</span>
          <span>Sathyamangalam, Erode District</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          Get in Touch with {siteConfig.schoolName}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Reach out to our Admissions Desk, Principal’s Office, or Residential Hostel Warden for
          campus visits, stream guidance, and transport route inquiries.
        </p>
      </section>

      {/* Contact Info Cards + Inquiry Form */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 space-y-6">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Direct Campus Directory
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Campus Address</div>
                  <p className="font-medium text-slate-900 dark:text-white mt-0.5">
                    {siteConfig.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneCall className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Phone Numbers</div>
                  <div className="font-mono tabular-nums font-medium text-slate-900 dark:text-white mt-0.5 space-x-3">
                    <a href={`tel:${siteConfig.phonePrimary}`} className="hover:text-amber-500">
                      {siteConfig.phonePrimary}
                    </a>
                    {siteConfig.phoneSecondary && (
                      <>
                        <span>·</span>
                        <a
                          href={`tel:${siteConfig.phoneSecondary}`}
                          className="hover:text-amber-500"
                        >
                          {siteConfig.phoneSecondary}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Official Email</div>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="font-medium text-amber-600 dark:text-amber-400 hover:underline mt-0.5 inline-block"
                  >
                    {siteConfig.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Working Hours</div>
                  <p className="font-medium text-slate-900 dark:text-white mt-0.5">
                    {siteConfig.workingHours}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Official Social Media Channels
              </div>
              <div className="flex flex-wrap gap-2">
                {socialItems.map((soc) => (
                  <a
                    key={soc.key}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{soc.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Send a Message to the School Office
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All inquiries are saved directly to our administrative inbox for prompt response.
            </p>
          </div>

          {submitted && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-400 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>
                Your message has been delivered to the SRT Universal Office. We will get back to you
                shortly.
              </span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label
                htmlFor="contactName"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Your Full Name *
              </label>
              <input
                id="contactName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contactEmail"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Email Address *
              </label>
              <input
                id="contactEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contactPhone"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Phone Number *
              </label>
              <input
                id="contactPhone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9842722045"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono tabular-nums text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contactSubject"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Subject *
              </label>
              <input
                id="contactSubject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Admissions / Hostel / Transport Inquiry"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="contactMessage"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Message *
              </label>
              <textarea
                id="contactMessage"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can our school office help you?"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Inquiry</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Dedicated Location Card & Embedded Google Map */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Campus Location &amp; Directions
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {siteConfig.schoolName} — Sathyamangalam
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{siteConfig.address}</p>
          </div>

          <a
            href={siteConfig.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <MapPin className="w-4 h-4" />
            <span>View on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="w-full h-96 bg-slate-950 relative">
          <iframe
            title="SRT Universal Higher Secondary School Sathyamangalam Location Map"
            src={siteConfig.googleMapsEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
};
