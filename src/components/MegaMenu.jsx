import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const MegaMenu = ({ category, onClose }) => {
  const menuData = {
    dogs: {
      title: 'DOG LIFE & CARE',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400',
      groups: [
        {
          name: 'Nutrition & Treats',
          links: [
            { label: 'Dog Food', path: '/shop?petType=dogs&category=Dog+Food' },
            { label: 'Premium Treats', path: '/shop?petType=dogs&category=Treats&subcategory=Treats' },
            { label: 'Bowls & Feeders', path: '/shop?petType=dogs&category=Treats&subcategory=Bowls+%26+Feeders' }
          ]
        },
        {
          name: 'Comfort & Play',
          links: [
            { label: 'Orthopedic Beds', path: '/shop?petType=dogs&category=Dog+Beds+%26+Cotes&subcategory=Beds' },
            { label: 'Interactive Toys', path: '/shop?petType=dogs&category=Treats&subcategory=Toys' },
            { label: 'Training Essentials', path: '/shop?petType=dogs&category=Treats&subcategory=Training' }
          ]
        },
        {
          name: 'Style & Grooming',
          links: [
            { label: 'Leather Collars & Leashes', path: '/shop?petType=dogs&category=Treats&subcategory=Collars+%26+Leashes' },
            { label: 'Premium Shampoo & Oils', path: '/shop?petType=dogs&category=Treats&subcategory=Grooming' },
            { label: 'Supplements & Coat Care', path: '/shop?petType=dogs&category=Treats&subcategory=Supplements' }
          ]
        }
      ]
    },
    birds: {
      title: 'AVIAN CARE',
      image: 'https://images.unsplash.com/photo-1480044965905-02098d419e96?q=80&w=400',
      groups: [
        {
          name: 'Avian Diet',
          links: [
            { label: 'Gourmet Seed Mixes', path: '/shop?petType=birds&category=Bird+Food&subcategory=Bird+Food' },
            { label: 'Mineral Blocks', path: '/shop?petType=birds&category=Bird+Food&subcategory=Supplements' },
            { label: 'Vitamins & Health Drops', path: '/shop?petType=birds&category=Bird+Food&subcategory=Supplements' }
          ]
        },
        {
          name: 'Habitat & Accessories',
          links: [
            { label: 'Iron Cages', path: '/shop?petType=birds&category=Cages+%26+Habitat&subcategory=Cages' },
            { label: 'Java Wood Perches', path: '/shop?petType=birds&category=Cages+%26+Habitat&subcategory=Perches' },
            { label: 'Automatic Feeders', path: '/shop?petType=birds&category=Cages+%26+Habitat&subcategory=Feeding+Accessories' }
          ]
        },
        {
          name: 'Chews & Play',
          links: [
            { label: 'Wooden Chew Toys', path: '/shop?petType=birds&category=Cages+%26+Habitat&subcategory=Toys' },
            { label: 'Avian Parasite Sprays', path: '/shop?petType=birds&category=Bird+Food&subcategory=Grooming' }
          ]
        }
      ]
    },
    reptiles: {
      title: 'HERPETOLOGY & HABITATS',
      image: 'https://images.unsplash.com/photo-1504450758481-7338eaa75e6a?q=80&w=400',
      groups: [
        {
          name: 'Enclosures & Substrate',
          links: [
            { label: 'Glass Terrariums', path: '/shop?petType=reptiles&category=Terrariums&subcategory=Terrariums' },
            { label: 'Coconut Husk Substrate', path: '/shop?petType=reptiles&category=Terrariums&subcategory=Substrate' },
            { label: 'Jungle Vines & Climbs', path: '/shop?petType=reptiles&category=Terrariums&subcategory=Décor' }
          ]
        },
        {
          name: 'Heating & Climate Control',
          links: [
            { label: 'Ceramic Heat Emitters', path: '/shop?petType=reptiles&category=Heating+%26+Lighting&subcategory=Heating' },
            { label: 'Digital Probe Thermometers', path: '/shop?petType=reptiles&category=Heating+%26+Lighting&subcategory=Thermometers' },
            { label: 'Humidity Equipment', path: '/shop?petType=reptiles&category=Heating+%26+Lighting&subcategory=Thermometers' }
          ]
        },
        {
          name: 'Health & UVB Lighting',
          links: [
            { label: 'ReptiSun Linear UVB Bulbs', path: '/shop?petType=reptiles&category=Heating+%26+Lighting&subcategory=UVB+Lighting' },
            { label: 'Calcium with D3 Powder', path: '/shop?petType=reptiles&category=Heating+%26+Lighting&subcategory=Calcium+%26+Supplements' },
            { label: 'Calcium (D3 Free) Powder', path: '/shop?petType=reptiles&category=Heating+%26+Lighting&subcategory=Calcium+%26+Supplements' }
          ]
        }
      ]
    },
    fish: {
      title: 'AQUATIC ECOSYSTEMS',
      image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=400',
      groups: [
        {
          name: 'Aquariums & Decor',
          links: [
            { label: 'Rimless Glass Aquariums', path: '/shop?petType=fish&category=Aquariums+%26+Tanks&subcategory=Aquariums' },
            { label: 'Live Anubias on Driftwood', path: '/shop?petType=fish&category=Water+Care+%26+Filtration&subcategory=Aquarium+Plants' }
          ]
        },
        {
          name: 'Water Care & Health',
          links: [
            { label: 'API Stress Coat Conditioner', path: '/shop?petType=fish&category=Water+Care+%26+Filtration&subcategory=Water+Conditioners' },
            { label: 'Cichlid Gold Pellets', path: '/shop?petType=fish&category=Water+Care+%26+Filtration&subcategory=Fish+Food' }
          ]
        },
        {
          name: 'Filtration & Pumps',
          links: [
            { label: 'Hang-On Back Power Filters', path: '/shop?petType=fish&category=Water+Care+%26+Filtration&subcategory=Filters' },
            { label: 'Quartz Glass Submersible Heaters', path: '/shop?petType=fish&category=Water+Care+%26+Filtration&subcategory=Pumps' },
            { label: 'Plant Growth LED Lights', path: '/shop?petType=fish&category=Water+Care+%26+Filtration&subcategory=Aquarium+Lighting' }
          ]
        }
      ]
    },
    pharmacy: {
      title: 'VETERINARY PHARMACY',
      image: 'https://images.unsplash.com/photo-1607619056574-7b8d304b3b86?q=80&w=400',
      groups: [
        {
          name: 'Everyday Supplements',
          links: [
            { label: 'Chondroitin Joint Support', path: '/shop?petType=pharmacy&category=Vitamins+%26+Supplements&subcategory=Joint+Care' },
            { label: 'Liquid Calcium Syrup', path: '/shop?petType=pharmacy&category=Vitamins+%26+Supplements&subcategory=Vitamins' },
            { label: 'Herbal Digestive Drops', path: '/shop?petType=pharmacy&category=Vitamins+%26+Supplements&subcategory=Digestive+Care' }
          ]
        },
        {
          name: 'Prescription Needed (Rx)',
          links: [
            { label: 'Meloxicam Anti-inflammatory', path: '/shop?petType=pharmacy&category=First+Aid+%26+Healthcare&subcategory=Joint+Care' },
            { label: 'Cephalexin Antibiotics', path: '/shop?petType=pharmacy&category=First+Aid+%26+Healthcare&subcategory=Skin+Care' },
            { label: 'Prednisolone Steroid Tablets', path: '/shop?petType=pharmacy&category=First+Aid+%26+Healthcare&subcategory=Skin+Care' },
            { label: 'Cyclosporine Atopic Drops', path: '/shop?petType=pharmacy&category=First+Aid+%26+Healthcare&subcategory=Skin+Care' }
          ]
        },
        {
          name: 'Safety First aid',
          links: [
            { label: 'First Aid Emergency Kits', path: '/shop?petType=pharmacy&category=First+Aid+%26+Healthcare&subcategory=First+Aid' }
          ]
        }
      ]
    }
  };

  const data = menuData[category];
  if (!data) return null;

  return (
    <div 
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full bg-white border-b border-beige shadow-premium animate-in fade-in slide-in-from-top-2 duration-200 z-40 hidden md:block"
    >
      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-4 gap-8">
        {/* Subcategory Links Columns */}
        {data.groups.map((group) => (
          <div key={group.name} className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-primary font-bold border-b border-beige pb-2">
              {group.name}
            </h3>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.path}
                    onClick={onClose}
                    className="text-xs text-gray-500 hover:text-accent font-medium transition duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Brand Banner Column */}
        <div className="bg-sand p-6 flex flex-col justify-between border border-beige">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] text-accent font-semibold tracking-wider uppercase">
              <Sparkles size={12} />
              <span>PAWORA SIGNATURE</span>
            </div>
            <h4 className="font-serif text-base text-primary font-bold">
              {data.title}
            </h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Curated and evaluated by veterinary specialists for high stability and reliability.
            </p>
          </div>
          
          <Link 
            to={category === 'pharmacy' ? '/pharmacy' : `/shop?petType=${category}`}
            onClick={onClose}
            className="text-xs text-primary font-bold hover:text-accent transition duration-200 flex items-center gap-1.5 group pt-4"
          >
            EXPLORE DEPARTMENT
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
