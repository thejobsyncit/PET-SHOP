import express from 'express';
import Service from '../models/Service.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { isDbConnected, readMockData, writeMockData } from '../utils/mockDb.js';

const router = express.Router();

// GET all public services (with optional category, city, mode, search query filters)
router.get('/', async (req, res) => {
  try {
    const { category, city, search, status = 'Active' } = req.query;
    let services = [];

    if (isDbConnected()) {
      const count = await Service.countDocuments();
      if (count === 0) {
        const mockData = readMockData('services');
        if (mockData.length > 0) {
          const toInsert = mockData.map(({ _id, ...rest }) => ({
            ...rest,
            provider: rest.provider || '60d5ec49ad70591244000001'
          }));
          await Service.insertMany(toInsert);
        }
      }

      const filter = { status };
      if (category && category !== 'All') {
        filter.category = category;
      }
      if (city) {
        filter.city = new RegExp(city, 'i');
      }
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { providerName: { $regex: search, $options: 'i' } }
        ];
      }
      services = await Service.find(filter).sort({ createdAt: -1 });
    } else {
      services = readMockData('services');
      if (status) {
        services = services.filter(s => s.status === status);
      }
      if (category && category !== 'All') {
        services = services.filter(s => s.category?.toLowerCase() === category.toLowerCase());
      }
      if (city) {
        services = services.filter(s => s.city?.toLowerCase().includes(city.toLowerCase()));
      }
      if (search) {
        const q = search.toLowerCase();
        services = services.filter(s =>
          s.title?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.providerName?.toLowerCase().includes(q)
        );
      }
    }

    res.json({ success: true, count: services.length, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET current provider's own services
router.get('/provider', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    let services = [];

    if (isDbConnected()) {
      services = await Service.find({ provider: req.user._id }).sort({ createdAt: -1 });
    } else {
      const allServices = readMockData('services');
      services = allServices.filter(s => {
        const pId = s.provider?._id || s.provider;
        return pId === userId || s.providerName === req.user.name;
      });
    }

    res.json({ success: true, count: services.length, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single service by ID
router.get('/:id', async (req, res) => {
  try {
    if (isDbConnected()) {
      const service = await Service.findById(req.params.id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      res.json({ success: true, service });
    } else {
      const services = readMockData('services');
      const service = services.find(s => s._id === req.params.id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      res.json({ success: true, service });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create new service (Protected)
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      category,
      price,
      discountPrice,
      priceUnit,
      duration,
      petTypes,
      serviceMode,
      location,
      state,
      city,
      area,
      contactPhone,
      contactWhatsapp,
      description,
      highlights,
      packages,
      images,
      status = 'Active'
    } = req.body;

    if (!title || !category || price === undefined) {
      return res.status(400).json({ success: false, message: 'Title, category and price are required' });
    }

    let newService;

    if (isDbConnected()) {
      newService = await Service.create({
        provider: req.user._id,
        providerName: req.user.name || 'Certified Provider',
        title,
        category,
        price: parseFloat(price) || 0,
        discountPrice: discountPrice ? parseFloat(discountPrice) : parseFloat(price) || 0,
        priceUnit: priceUnit || 'per session',
        duration: duration || '45 mins',
        petTypes: petTypes && petTypes.length > 0 ? petTypes : ['Dogs', 'Cats'],
        serviceMode: serviceMode || 'Clinic / Facility',
        location: location || req.user.location || 'Bangalore, Karnataka',
        state: state || 'Karnataka',
        city: city || 'Bangalore',
        area: area || '',
        contactPhone: contactPhone || req.user.mobile || '',
        contactWhatsapp: contactWhatsapp || req.user.whatsapp || contactPhone || '',
        description,
        highlights: Array.isArray(highlights) ? highlights : [],
        packages: Array.isArray(packages) ? packages : [],
        images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800'],
        status,
        rating: 5.0,
        reviewsCount: 0,
        isVerified: true
      });
    } else {
      const services = readMockData('services');
      newService = {
        _id: `SRV-${Math.floor(100000 + Math.random() * 900000)}`,
        provider: req.user._id.toString(),
        providerName: req.user.name || 'Certified Provider',
        title,
        category,
        price: parseFloat(price) || 0,
        discountPrice: discountPrice ? parseFloat(discountPrice) : parseFloat(price) || 0,
        priceUnit: priceUnit || 'per session',
        duration: duration || '45 mins',
        petTypes: petTypes && petTypes.length > 0 ? petTypes : ['Dogs', 'Cats'],
        serviceMode: serviceMode || 'Clinic / Facility',
        location: location || req.user.location || 'Bangalore, Karnataka',
        state: state || 'Karnataka',
        city: city || 'Bangalore',
        area: area || '',
        contactPhone: contactPhone || req.user.mobile || '',
        contactWhatsapp: contactWhatsapp || req.user.whatsapp || contactPhone || '',
        description,
        highlights: Array.isArray(highlights) ? highlights : [],
        packages: Array.isArray(packages) ? packages : [],
        images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800'],
        status,
        rating: 5.0,
        reviewsCount: 0,
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      services.unshift(newService);
      writeMockData('services', services);
    }

    res.status(201).json({ success: true, service: newService });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update service
router.put('/:id', protect, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const userId = req.user._id.toString();

    if (isDbConnected()) {
      const service = await Service.findById(serviceId);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

      if (service.provider.toString() !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this service' });
      }

      Object.assign(service, req.body);
      await service.save();
      res.json({ success: true, service });
    } else {
      const services = readMockData('services');
      const idx = services.findIndex(s => s._id === serviceId);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Service not found' });

      const pId = services[idx].provider?._id || services[idx].provider;
      if (pId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this service' });
      }

      services[idx] = { ...services[idx], ...req.body, updatedAt: new Date().toISOString() };
      writeMockData('services', services);
      res.json({ success: true, service: services[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH toggle service status (Active / Paused / Draft)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const serviceId = req.params.id;
    const userId = req.user._id.toString();

    if (!['Active', 'Paused', 'Draft'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (isDbConnected()) {
      const service = await Service.findById(serviceId);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

      if (service.provider.toString() !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      service.status = status;
      await service.save();
      res.json({ success: true, service });
    } else {
      const services = readMockData('services');
      const idx = services.findIndex(s => s._id === serviceId);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Service not found' });

      services[idx].status = status;
      writeMockData('services', services);
      res.json({ success: true, service: services[idx] });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE remove service
router.delete('/:id', protect, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const userId = req.user._id.toString();

    if (isDbConnected()) {
      const service = await Service.findById(serviceId);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

      if (service.provider.toString() !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      await service.deleteOne();
      res.json({ success: true, message: 'Service deleted successfully' });
    } else {
      const services = readMockData('services');
      const filtered = services.filter(s => s._id !== serviceId);
      writeMockData('services', filtered);
      res.json({ success: true, message: 'Service deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
