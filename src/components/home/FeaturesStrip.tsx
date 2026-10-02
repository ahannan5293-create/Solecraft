import React from 'react';
import { Truck, ShieldCheck, Headset, RefreshCcw } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export default function FeaturesStrip() {
  const features = [
    {
      icon: <Truck className="w-7 h-7 text-[#6C5CE7]" strokeWidth={1.5} />,
      title: "Free Shipping",
      desc: `On orders over ${formatPrice(10000)}`,
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-[#6C5CE7]" strokeWidth={1.5} />,
      title: "Secure Payment",
      desc: "100% protected",
    },
    {
      icon: <Headset className="w-7 h-7 text-[#6C5CE7]" strokeWidth={1.5} />,
      title: "24/7 Support",
      desc: "We're here to help",
    },
    {
      icon: <RefreshCcw className="w-7 h-7 text-[#6C5CE7]" strokeWidth={1.5} />,
      title: "Easy Returns",
      desc: "Hassle free",
    },
  ];

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-2 md:flex md:flex-row md:justify-between items-center gap-y-10 gap-x-4 md:gap-0">
          {features.map((feature, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-3 lg:gap-4 w-full md:w-auto justify-start">
                <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-[#0f0f1a] font-extrabold text-[15px] mb-0.5">{feature.title}</h4>
                  <p className="text-gray-500 text-[13px]">{feature.desc}</p>
                </div>
              </div>
              {i < features.length - 1 && (
                <div className="hidden md:block w-px h-12 bg-gray-200 mx-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
