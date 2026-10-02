import React from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    id: 1,
    text: "Solecraft has completely changed the way I shop for sneakers. Amazing quality, fast shipping, and the best selection I've ever seen!",
    name: "Ahmed Raza",
    avatar: "https://i.pravatar.cc/150?u=a",
    stars: 5
  },
  {
    id: 2,
    text: "The collection is incredible and the whole experience feels premium. Definitely my go-to place for sneakers!",
    name: "Sara Khan",
    avatar: "https://i.pravatar.cc/150?u=b",
    stars: 5
  },
  {
    id: 3,
    text: "Finally, a store that gets sneaker culture. The quality is top-notch and the customer service is really helpful!",
    name: "Usman Ali",
    avatar: "https://i.pravatar.cc/150?u=c",
    stars: 5
  }
];

export default function Testimonials() {
  return (
    <section className="w-full">
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-[#6C5CE7] tracking-widest font-bold text-[0.7rem] uppercase mb-2">
            Real Stories
          </p>
          <h2 className="text-[#0f0f1a] font-extrabold text-4xl tracking-[-0.03em]">
            What Our Customers Say
          </h2>
        </div>
        <div className="flex gap-3">
          <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 hover:text-[#0f0f1a]">
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 hover:text-[#0f0f1a]">
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map(review => (
          <div key={review.id} className="bg-white border border-gray-100 shadow-sm p-8 rounded-3xl flex flex-col justify-between min-h-[240px]">
            <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
              "{review.text}"
            </p>
            <div className="flex items-center gap-4">
              <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
              <div>
                <h4 className="text-[#0f0f1a] font-bold text-[15px] mb-1">{review.name}</h4>
                <div className="flex gap-1 text-[#6C5CE7]">
                  {[...Array(review.stars)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
