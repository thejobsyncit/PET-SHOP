import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const writeJSON = (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Seeded ${data.length} records into ${filename}`);
};

const customerId = '6584c6ef0c25a0ab6e5a0101'; // Default Customer ID from seedData.js
const adminId = '6584c6ef0c25a0ab6e5a0100'; // Default Admin ID from seedData.js

const mockListings = [
  {
    _id: 'LIST-101',
    user: { _id: adminId, name: 'Pawora Admin', email: 'admin@pawora.com' },
    title: 'Champion Line Alaskan Malamute Puppies',
    petType: 'dogs',
    breed: 'Alaskan Malamute',
    age: '2 months',
    price: 35000,
    description: 'Beautiful champion line Alaskan Malamute puppies. De-wormed, vaccinated, and microchipped. Very active and healthy.',
    images: ['https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800'],
    location: 'Delhi NCR',
    contactPhone: '+91 98765 43210',
    isVerified: true,
    status: 'Available',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'LIST-102',
    user: { _id: adminId, name: 'Pawora Admin', email: 'admin@pawora.com' },
    title: 'Sweet Siamese Kitten looking for Rehoming',
    petType: 'cats',
    breed: 'Siamese Cat',
    age: '4 months',
    price: 0, // Free rehoming
    description: 'Very gentle and sweet Siamese kitten looking for a warm family. Loves to cuddle and play with toys.',
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800'],
    location: 'Bangalore, KA',
    contactPhone: '+91 80123 45678',
    isVerified: true,
    status: 'Available',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'LIST-103',
    user: { _id: customerId, name: 'Test Customer', email: 'customer1@pawora.com' },
    title: 'Talking African Grey Parrot with Cage',
    petType: 'birds',
    breed: 'African Grey Parrot',
    age: '1 year',
    price: 45000,
    description: 'Smart talking parrot, responds to commands and speaks basic phrases. Includes large standing metal cage and food dishes.',
    images: ['https://images.unsplash.com/photo-1522856268848-d11edf133a70?q=80&w=800'],
    location: 'Mumbai, MH',
    contactPhone: '+91 99000 88888',
    isVerified: false,
    status: 'Available',
    createdAt: new Date().toISOString()
  }
];

const mockAdoptions = [
  {
    _id: 'ADOPT-201',
    shelterName: 'Happy Paws Rescue Sanctuary',
    shelterLocation: 'Electronic City, Bangalore',
    petName: 'Rocky',
    petType: 'dogs',
    breed: 'Indie Dog (Mixed)',
    age: '1.5 years',
    rescueStory: 'Rescued from a building construction site. Rocky was malnourished but is now fully rehabilitated, vaccinated, and microchipped.',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800',
    healthStatus: { vaccinated: true, neutered: true, microchipped: true },
    adoptionFee: 0,
    inquiries: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'ADOPT-202',
    shelterName: 'Adopt-A-Companion NGO',
    shelterLocation: 'Andheri West, Mumbai',
    petName: 'Luna',
    petType: 'cats',
    breed: 'Calico Cat',
    age: '6 months',
    rescueStory: 'Found abandoned during monsoon rains. Luna is highly socialized, extremely affectionate, and gets along well with other pets.',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=800',
    healthStatus: { vaccinated: true, neutered: false, microchipped: false },
    adoptionFee: 0,
    inquiries: [],
    createdAt: new Date().toISOString()
  }
];

const mockBreedings = [
  {
    _id: 'STUD-301',
    user: { _id: adminId, name: 'Pawora Admin', email: 'admin@pawora.com' },
    studName: 'Thor (KCI Registered Champion)',
    petType: 'dogs',
    breed: 'Golden Retriever',
    age: '2.5 years',
    kciNumber: 'KCI-RET-98210',
    studFee: 15000,
    description: 'Thor is a purebred KCI-certified golden retriever stud. Highly active, excellent health history, clean pedigree hips checks.',
    images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800'],
    pedigreeDetails: { sire: 'Intl Champion Golden Sun', dam: 'Grand National Winner Lady Star' },
    location: 'Bangalore, KA',
    contactPhone: '+91 94444 33333',
    isVerified: true,
    createdAt: new Date().toISOString()
  }
];

const mockBookings = [
  {
    _id: 'BOOK-401',
    user: customerId,
    providerName: 'Dr. Ramesh Kumar (Pawora Vet Clinic)',
    serviceType: 'Veterinary',
    location: 'MG Road, Bangalore',
    date: '2026-08-28',
    timeSlot: '10:00 AM - 11:00 AM',
    petDetails: { name: 'Bruno', type: 'dog', breed: 'German Shepherd' },
    status: 'Pending',
    fee: 600,
    paymentStatus: 'Unpaid',
    createdAt: new Date().toISOString()
  }
];

const mockMessages = [
  {
    _id: 'MSG-501',
    sender: { _id: customerId, name: 'Test Customer', email: 'customer1@pawora.com' },
    recipient: { _id: adminId, name: 'Pawora Admin', email: 'admin@pawora.com' },
    listingRef: 'LIST-101',
    messageText: 'Hello! I am interested in the Alaskan Malamute puppy. Is it still available?',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: 'MSG-502',
    sender: { _id: adminId, name: 'Pawora Admin', email: 'admin@pawora.com' },
    recipient: { _id: customerId, name: 'Test Customer', email: 'customer1@pawora.com' },
    listingRef: 'LIST-101',
    messageText: 'Yes, it is! You can schedule a home visit this Saturday if you like.',
    isRead: true,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

writeJSON('listings.json', mockListings);
writeJSON('adoptions.json', mockAdoptions);
writeJSON('breedings.json', mockBreedings);
writeJSON('bookings.json', mockBookings);
writeJSON('messages.json', mockMessages);

console.log('India Pet Hub seeder execution completed successfully.');
