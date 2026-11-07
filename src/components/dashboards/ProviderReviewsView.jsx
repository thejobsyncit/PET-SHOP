import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Star, StarHalf, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { safeSetItem, safeGetItem } from '../../utils/safeStorage.js';

// Category-tailored realistic reviews catalog
const DEFAULT_CATEGORY_REVIEWS = {
  grooming: [
    {
      id: 'groom-rev-1',
      name: 'Aditi Sharma',
      avatarInitial: 'AS',
      time: '2 days ago',
      petType: 'Golden Retriever',
      serviceType: 'Full Spa & De-shedding',
      rating: 5,
      comment: 'Velvet Fur Spa did a magnificent grooming session on my retriever. His coat is silky, claws trimmed neatly, and he smells wonderful! The bath & brush out was so gentle.',
      reply: null
    },
    {
      id: 'groom-rev-2',
      name: 'Rohan Verma',
      avatarInitial: 'RV',
      time: '1 week ago',
      petType: 'Shih Tzu',
      serviceType: 'Teddy Bear Haircut',
      rating: 5,
      comment: 'Best styling and de-matting treatment in town. Very patient groomers who know how to calm nervous pups.',
      reply: {
        text: 'Thank you Rohan! It was our pleasure caring for your lovely puppy. See you next month for his routine trim!',
        date: '5 days ago'
      }
    },
    {
      id: 'groom-rev-3',
      name: 'Sneha Nair',
      avatarInitial: 'SN',
      time: '2 weeks ago',
      petType: 'Persian Cat',
      serviceType: 'Feline Lion Cut & Bath',
      rating: 4,
      comment: 'Great styling for my Persian cat. Clean and hygienic tables, took great care with sensitive areas.',
      reply: null
    }
  ],
  hostel: [
    {
      id: 'hostel-rev-1',
      name: 'Rahul & Leo',
      avatarInitial: 'RL',
      time: '3 days ago',
      petType: 'Beagle',
      serviceType: 'Executive Dog Suite',
      rating: 5,
      comment: 'Happy Paws is our go-to boarding facility whenever we travel out of Bangalore. The daily video updates and pool session gave us complete peace of mind!',
      reply: null
    },
    {
      id: 'hostel-rev-2',
      name: 'Meera & Oreo',
      avatarInitial: 'MO',
      time: '1 week ago',
      petType: 'Siberian Husky',
      serviceType: 'VIP Climate Controlled Suite',
      rating: 5,
      comment: 'The VIP Suite with 24/7 CCTV live stream is worth every single penny. Clean AC room and genuine caring attendants.',
      reply: {
        text: 'Thank you Meera! Oreo had a blast running in the green play zone with his new canine buddies.',
        date: '6 days ago'
      }
    },
    {
      id: 'hostel-rev-3',
      name: 'Karan & Bruno',
      avatarInitial: 'KB',
      time: '2 weeks ago',
      petType: 'Labrador',
      serviceType: 'Standard Boarding + Playtime',
      rating: 5,
      comment: 'Prompt check-in and checkout. Handled his special renal diet with great attention and care.',
      reply: null
    }
  ],
  training: [
    {
      id: 'train-rev-1',
      name: 'Vikram Patel',
      avatarInitial: 'VP',
      time: '2 days ago',
      petType: 'German Shepherd',
      serviceType: 'Advanced Off-Leash Obedience',
      rating: 5,
      comment: 'Canine Excellence transformed Rocky! From pulling violently on the leash to walking calmly by my side in just 4 weeks.',
      reply: null
    },
    {
      id: 'train-rev-2',
      name: 'Ananya Roy',
      avatarInitial: 'AR',
      time: '1 week ago',
      petType: 'Indie Pup',
      serviceType: 'Puppy Kindergarten & Socialization',
      rating: 5,
      comment: 'The puppy socialization and positive reinforcement classes are top-notch. Highly certified trainers who genuinely love dogs.',
      reply: {
        text: 'Thank you Ananya! Rocky was an eager learner from day one. Keep practicing the recall cues at home!',
        date: '4 days ago'
      }
    },
    {
      id: 'train-rev-3',
      name: 'Sanjay K.',
      avatarInitial: 'SK',
      time: '3 weeks ago',
      petType: 'Golden Retriever',
      serviceType: 'Agility & Fitness Camp',
      rating: 5,
      comment: 'Agility course and obstacle training was so engaging. My dog looks forward to every weekend session.',
      reply: null
    }
  ],
  transport: [
    {
      id: 'trans-rev-1',
      name: 'Rajesh Menon',
      avatarInitial: 'RM',
      time: '3 days ago',
      petType: 'Labrador Retriever',
      serviceType: 'Inter-City AC Pet Taxi',
      rating: 5,
      comment: 'SafePet relocated our Lab from Delhi to Bangalore smoothly. Climate-controlled pet van, regular hydration stops, and live GPS tracking throughout.',
      reply: null
    },
    {
      id: 'trans-rev-2',
      name: 'Priya Deshmukh',
      avatarInitial: 'PD',
      time: '1 week ago',
      petType: '2 Persian Cats',
      serviceType: 'Airport Cargo & Relocation',
      rating: 5,
      comment: 'Stress-free airline cargo assistance. All health certificates and IATA approved travel crates were handled with utmost professionalism.',
      reply: {
        text: 'Thank you Priya! We were honored to safely reunite you with your adorable feline family in Chennai.',
        date: '5 days ago'
      }
    },
    {
      id: 'trans-rev-3',
      name: 'Deepak Rao',
      avatarInitial: 'DR',
      time: '2 weeks ago',
      petType: 'Beagle',
      serviceType: 'City Vet Express Ride',
      rating: 4,
      comment: 'Very polite driver with pet safety harness installed in car. Punctual doorstep pickup.',
      reply: null
    }
  ],
  breeding: [
    {
      id: 'breed-rev-1',
      name: 'Karthik S.',
      avatarInitial: 'KS',
      time: '2 days ago',
      petType: 'French Bulldog',
      serviceType: 'Champion Stud Service',
      rating: 5,
      comment: 'Excellent breeder! Maximus was healthy, KC certified, and well-behaved. The mating process was smooth, professional, and successful.',
      reply: null
    },
    {
      id: 'breed-rev-2',
      name: 'Deepa M.',
      avatarInitial: 'DM',
      time: '1 week ago',
      petType: 'Golden Retriever',
      serviceType: 'Verified Sire Lineage',
      rating: 5,
      comment: 'Highly reliable and knowledgeable about genetics and pedigrees. Our dam delivered 6 healthy champion-line puppies!',
      reply: {
        text: 'Thank you Deepa! Always a privilege collaborating with responsible and caring dog parents.',
        date: '4 days ago'
      }
    },
    {
      id: 'breed-rev-3',
      name: 'Rohan K.',
      avatarInitial: 'RK',
      time: '3 weeks ago',
      petType: 'German Shepherd',
      serviceType: 'Show-Line Stud Service',
      rating: 4,
      comment: 'Good service, very knowledgeable about lineage papers, hip scoring, and breed standards.',
      reply: null
    }
  ],
  walking: [
    {
      id: 'walk-rev-1',
      name: 'Shreya Sengupta',
      avatarInitial: 'SS',
      time: '2 days ago',
      petType: 'Beagle',
      serviceType: 'Daily 45-Min Solo Walk',
      rating: 5,
      comment: 'Swift Paws is amazing! Punctual daily 45-min walks with live GPS route map and cute photo updates sent right after every walk.',
      reply: null
    },
    {
      id: 'walk-rev-2',
      name: 'Amit Joshi',
      avatarInitial: 'AJ',
      time: '1 week ago',
      petType: 'Indie Dog',
      serviceType: 'Evening Fitness Walk',
      rating: 5,
      comment: 'My dog gets super excited whenever the walker rings the bell. Trustworthy, energetic, and gentle handling of leash reactivity.',
      reply: {
        text: 'Thank you Amit! It is an absolute delight walking such a happy and energetic companion.',
        date: '5 days ago'
      }
    },
    {
      id: 'walk-rev-3',
      name: 'Kavita Pillai',
      avatarInitial: 'KP',
      time: '2 weeks ago',
      petType: 'Golden Retriever',
      serviceType: 'Pack Socialization Walk',
      rating: 4,
      comment: 'Great walking routine that helps burn off his evening energy. He sleeps like an angel at night now.',
      reply: null
    }
  ],
  insurance: [
    {
      id: 'ins-rev-1',
      name: 'Vivek Mehra',
      avatarInitial: 'VM',
      time: '2 days ago',
      petType: 'French Bulldog',
      serviceType: 'Comprehensive Health Cover',
      rating: 5,
      comment: 'PawProtect processed my emergency surgery claim within 48 hours without any hassle. The cashless hospital network worked flawlessly.',
      reply: null
    },
    {
      id: 'ins-rev-2',
      name: 'Sunita Rao',
      avatarInitial: 'SR',
      time: '1 week ago',
      petType: 'Persian Cat',
      serviceType: 'Accident & Illness Shield',
      rating: 5,
      comment: 'Transparent policy terms, covers regular OPD and diagnostic ultrasounds. The customer claims team is remarkably responsive.',
      reply: {
        text: 'Thank you Sunita! We are honored to keep your beloved pet protected through thick and thin.',
        date: '4 days ago'
      }
    },
    {
      id: 'ins-rev-3',
      name: 'George Thomas',
      avatarInitial: 'GT',
      time: '3 weeks ago',
      petType: 'Labrador',
      serviceType: 'Senior Dog Plan',
      rating: 4,
      comment: 'Affordable monthly premium with very high sum insured. Gives immense financial peace of mind.',
      reply: null
    }
  ],
  seller: [
    {
      id: 'seller-rev-1',
      name: 'Varun Khanna',
      avatarInitial: 'VK',
      time: '2 days ago',
      petType: 'Golden Retriever Puppy',
      serviceType: 'Verified Pet Purchase',
      rating: 5,
      comment: 'Royal Paws Studio provided an active, healthy, fully vaccinated puppy with genuine KCI pedigree papers and microchip. Ethical and caring seller!',
      reply: null
    },
    {
      id: 'seller-rev-2',
      name: 'Pooja Hegde',
      avatarInitial: 'PH',
      time: '1 week ago',
      petType: 'Persian Kitten',
      serviceType: 'Vaccinated Companion',
      rating: 5,
      comment: 'Spotless clean breeding environment, complete health check certificate, and very helpful starter diet guide.',
      reply: {
        text: 'Thank you Pooja! Wishing you countless heartwarming memories with your sweet kitten.',
        date: '5 days ago'
      }
    },
    {
      id: 'seller-rev-3',
      name: 'Nikhil Sen',
      avatarInitial: 'NS',
      time: '2 weeks ago',
      petType: 'Shih Tzu Puppy',
      serviceType: 'Registered Breed',
      rating: 4,
      comment: 'Very communicative breeder with prompt safe pet handover and vet clearance paperwork.',
      reply: null
    }
  ],
  products: [
    {
      id: 'prod-rev-1',
      name: 'Divya Balaji',
      avatarInitial: 'DB',
      time: '2 days ago',
      petType: 'Royal Canin Maxi Adult',
      serviceType: 'Nutrition & Feed',
      rating: 5,
      comment: 'Authentic pet food delivered within 24 hours in tamper-proof packaging. Fresh stock with long expiry date and best prices in Bangalore!',
      reply: null
    },
    {
      id: 'prod-rev-2',
      name: 'Harish N.',
      avatarInitial: 'HN',
      time: '1 week ago',
      petType: 'Orthopedic Dog Bed',
      serviceType: 'Bedding & Comfort',
      rating: 5,
      comment: 'Super high quality memory foam pet bed. My senior dog’s joint stiffness has visibly reduced. Exceptional product seller!',
      reply: {
        text: 'Thank you Harish! Delighted to hear our orthopedic bedding is bringing restful comfort to your boy.',
        date: '4 days ago'
      }
    },
    {
      id: 'prod-rev-3',
      name: 'Tanvi Agarwal',
      avatarInitial: 'TA',
      time: '2 weeks ago',
      petType: 'Dental Chew Treats Pack',
      serviceType: 'Pet Snacks & Wellness',
      rating: 4,
      comment: 'My dogs loved the dental chew sticks. Freshly sealed and rapid dispatch.',
      reply: null
    }
  ],
  adoption: [
    {
      id: 'adopt-rev-1',
      name: 'Anita George',
      avatarInitial: 'AG',
      time: '3 days ago',
      petType: 'Adopted Indie Puppy (Bella)',
      serviceType: 'Shelter Rehoming',
      rating: 5,
      comment: 'Hope Animal Sanctuary does incredible work. The adoption counseling, vaccination booklet, and post-adoption support was compassionate and thorough.',
      reply: null
    },
    {
      id: 'adopt-rev-2',
      name: 'Sandeep Varma',
      avatarInitial: 'SV',
      time: '1 week ago',
      petType: 'Senior Beagle (Bruno)',
      serviceType: 'Forever Home Adoption',
      rating: 5,
      comment: 'Adopting our senior boy was the best decision of our lives. Thank you for nursing him back to vitality and trusting us to give him a forever home.',
      reply: {
        text: 'Thank you Sandeep! Thank you for opening your heart and giving Bruno the loving home he truly deserved.',
        date: '5 days ago'
      }
    },
    {
      id: 'adopt-rev-3',
      name: 'Radhika Iyer',
      avatarInitial: 'RI',
      time: '3 weeks ago',
      petType: 'Rescued Kitten (Mochi)',
      serviceType: 'Feline Adoption',
      rating: 5,
      comment: 'Transparent adoption protocol. Vaccinated, dewormed, and microchipped before handover. Wonderful shelter team!',
      reply: null
    }
  ],
  vet: [
    {
      id: 'rev-1',
      name: 'Aditi Kumar',
      avatarInitial: 'AK',
      time: '2 days ago',
      petType: 'Golden Retriever',
      serviceType: 'General Consultation',
      rating: 5,
      comment: 'Dr. Ramesh is extremely patient and thorough. My Golden Retriever was very anxious but the doctor calmed him down effortlessly. The clinic is very clean and well-equipped.',
      reply: null
    },
    {
      id: 'rev-2',
      name: 'Siddharth Jain',
      avatarInitial: 'SJ',
      time: '1 week ago',
      petType: 'Persian Cat',
      serviceType: 'Video Tele-Consult',
      rating: 4,
      comment: 'Good doctor, explained the diagnosis clearly via Video Consult. The digital prescription was generated immediately after the call.',
      reply: null
    },
    {
      id: 'rev-3',
      name: 'Meera Nambiar',
      avatarInitial: 'MN',
      time: '2 weeks ago',
      petType: 'Beagle',
      serviceType: 'Orthopedic Exam',
      rating: 5,
      comment: 'Exceptional orthopedic diagnosis. Handled the surgical suture check with extreme tenderness. Bruno is running around happily again!',
      reply: {
        text: 'Thank you Meera! It was our pleasure caring for your energetic boy. Remember to continue his joint supplements as prescribed.',
        date: '10 days ago'
      }
    }
  ]
};

const ProviderReviewsView = ({
  serviceCategory = 'Service Provider',
  title = 'Customer Reviews',
  subtitle = 'Verified customer ratings, feedback, and official provider replies.',
  roleTitle = 'Provider',
  storageKeyPrefix = 'provider',
  defaultReviews = null
}) => {
  const { user } = useSelector(state => state.auth);

  const storageKey = `joshpetshub_${storageKeyPrefix}_reviews_v2`;

  const [reviews, setReviews] = useState(() => {
    try {
      const stored = safeGetItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}

    if (Array.isArray(defaultReviews) && defaultReviews.length > 0) {
      return defaultReviews;
    }

    const fallbackCat = DEFAULT_CATEGORY_REVIEWS[storageKeyPrefix] || DEFAULT_CATEGORY_REVIEWS.grooming;
    return fallbackCat;
  });

  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Persist reviews when updated
  const saveReviews = (updated) => {
    setReviews(updated);
    safeSetItem(storageKey, JSON.stringify(updated));
  };

  // Open inline reply box
  const handleOpenReplyBox = (reviewId) => {
    setReplyingReviewId(reviewId);
    setReplyText('');
  };

  // Submit reply
  const handlePostReviewReply = (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    const updated = reviews.map(rev => {
      if (rev.id === reviewId) {
        return {
          ...rev,
          reply: {
            text: replyText.trim(),
            date: 'Just now'
          }
        };
      }
      return rev;
    });

    saveReviews(updated);
    setReplyingReviewId(null);
    setReplyText('');
    toast.success(`${roleTitle} reply published under review!`);
  };

  // Metrics computation matching Vet Dashboard
  const { averageRating, totalReviewsCount, starBreakdown } = useMemo(() => {
    const totalCount = reviews.length * 40; // Matching Vet Dashboard scaled representation (120)
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    // Default weights mirroring 4.9 rating
    counts[5] = Math.round(totalCount * 0.9);
    counts[4] = totalCount - counts[5];

    return {
      averageRating: '4.9',
      totalReviewsCount: totalCount,
      starBreakdown: [
        { star: 5, count: counts[5], pct: '88%' },
        { star: 4, count: counts[4], pct: '12%' },
        { star: 3, count: 0, pct: '0%' },
        { star: 2, count: 0, pct: '0%' },
        { star: 1, count: 0, pct: '0%' }
      ]
    };
  }, [reviews]);

  const providerDisplayName = user?.businessName || user?.name || `${serviceCategory} Official`;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">{title}</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Rating & Distribution Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0F2E23] text-white rounded-2xl p-6 shadow-md flex flex-col items-center justify-center text-center">
          <h3 className="text-5xl font-black text-amber-300 mb-2">{averageRating}</h3>
          <div className="flex items-center gap-1 text-amber-300 mb-3">
            <Star size={20} fill="currentColor" />
            <Star size={20} fill="currentColor" />
            <Star size={20} fill="currentColor" />
            <Star size={20} fill="currentColor" />
            <StarHalf size={20} fill="currentColor" />
          </div>
          <p className="text-xs font-bold text-teal-100 uppercase tracking-widest">
            Based on {totalReviewsCount} reviews
          </p>
        </div>

        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-center">
          {starBreakdown.map((item) => (
            <div key={item.star} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 w-12">{item.star} Stars</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: item.pct }}
                ></div>
              </div>
              <span className="text-xs font-bold text-slate-400 w-8 text-right">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Testimonials List */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest">
          Verified Customer Testimonials
        </h3>

        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                  {rev.avatarInitial || (rev.name ? rev.name.substring(0, 2).toUpperCase() : 'CU')}
                </div>
                <div>
                  <h4 className="font-bold text-[#0F2E23]">{rev.name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {rev.time || rev.date} • For {rev.petType || rev.pet || rev.serviceType || 'Service'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    fill={i < rev.rating ? 'currentColor' : 'none'}
                    className={i < rev.rating ? 'text-amber-400' : 'text-slate-200'}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              {rev.comment}
            </p>

            {/* Provider's verified response */}
            {rev.reply && (
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 mt-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#0F2E23]">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>{providerDisplayName} (Verified {roleTitle} Reply)</span>
                  <span className="text-[10px] text-slate-400 font-semibold ml-auto">
                    {typeof rev.reply === 'object' ? rev.reply.date : 'Recent'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {typeof rev.reply === 'object' ? rev.reply.text : rev.reply}
                </p>
              </div>
            )}

            {/* Reply action */}
            {!rev.reply && (
              <div className="pt-2">
                {replyingReviewId === rev.id ? (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in duration-200">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Write your professional response as ${roleTitle}...`}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F2E23]"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingReviewId(null)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePostReviewReply(rev.id)}
                        className="px-4 py-1.5 bg-[#0F2E23] text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-[#163e30] transition cursor-pointer shadow-xs"
                      >
                        Post Public Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenReplyBox(rev.id)}
                    className="text-emerald-700 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-emerald-800 transition cursor-pointer"
                  >
                    <MessageSquare size={14} /> Reply publicly as {roleTitle}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProviderReviewsView;
