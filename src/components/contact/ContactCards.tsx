import React from 'react';
import { Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react';

const contactMethods = [
  {
    id: 'email',
    icon: <Mail className="w-5 h-5 text-white" strokeWidth={2} />,
    title: 'Email Us',
    detail: 'support@solecraft.com',
  },
  {
    id: 'call',
    icon: <Phone className="w-5 h-5 text-white" strokeWidth={2} />,
    title: 'Call Us',
    detail: '+92 300 123 4567',
  },
  {
    id: 'visit',
    icon: <MapPin className="w-5 h-5 text-white" strokeWidth={2} />,
    title: 'Visit Us',
    detail: '123 Fashion Street,\nLahore, Pakistan',
  },
  {
    id: 'hours',
    icon: <Clock className="w-5 h-5 text-white" strokeWidth={2} />,
    title: 'Business Hours',
    detail: 'Mon-Sat 10AM-9PM,\nSun 11AM-6PM',
  },
];

export default function ContactCards() {
  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method) => (
            <div 
              key={method.id} 
              className="bg-gradient-to-br from-[#f9f8ff] to-[#f2efff] border border-[#ede9ff] rounded-3xl p-8 flex flex-col group transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#6C5CE7] flex items-center justify-center mb-6 shadow-md transition-transform group-hover:scale-110">
                {method.icon}
              </div>
              <h3 className="text-xl font-extrabold text-[#0f0f1a] mb-2">{method.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line mb-8 flex-1">
                {method.detail}
              </p>
              <div className="mt-auto">
                <ArrowRight className="w-5 h-5 text-[#6C5CE7] transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
