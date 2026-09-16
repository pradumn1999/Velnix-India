import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET /api/cjdropshipping/status - gateway connection check
router.get('/status', (_req: Request, res: Response) => {
  try {
    const config = store.getCJConfig();
    res.json({
      success: true,
      data: {
        status: 'ONLINE',
        mode: process.env.CJ_API_KEY ? 'LIVE_PRODUCTION' : 'SANDBOX_SIMULATOR',
        email: config.email,
        warehouseLocation: 'Gurugram Central Transit & Shenzhen Global Air Hub',
        lastSync: config.lastSyncTime,
        walletBalanceINR: config.warehouseBalanceINR,
        connectedProductsCount: config.totalCatalogItems,
        supportedCouriers: ['BlueDart Express', 'Delhivery Surface & Air', 'Shadowfax Logistics'],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cjdropshipping/sync - triggers inventory sync
router.post('/sync', (_req: Request, res: Response) => {
  try {
    const result = store.syncCJInventory();
    res.json({
      success: true,
      message: `Synchronized ${result.syncedCount} items successfully with CJdropshipping stock database`,
      result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cjdropshipping/calculate-freight - freight calculator for Indian PIN codes
router.post('/calculate-freight', (req: Request, res: Response) => {
  try {
    const { pincode, weightGrams } = req.body;
    const weight = Number(weightGrams) || 350;
    const pin = String(pincode || '560103');

    const pinInfo = store.lookupPincode(pin);

    // Rate calculation: standard base 49 INR + weight tier
    const baseRate = weight > 1000 ? 99 : 0; // Free under 1kg on NovaKart

    res.json({
      success: true,
      data: {
        pincode: pin,
        serviceable: pinInfo.found,
        city: pinInfo.found ? (pinInfo as any).city : 'Unknown',
        courier: 'BlueDart Express Air (CJ Official Line)',
        estimatedDays: pinInfo.found ? (pinInfo as any).days : 4,
        shippingFeeINR: baseRate,
        insuranceFeeINR: 0,
        codAvailable: pinInfo.found ? (pinInfo as any).codAvailable : true,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cjdropshipping/import-product - Quick import sample SKU from CJ catalog
router.post('/import-product', (req: Request, res: Response) => {
  try {
    const { cjProductId, customPrice } = req.body;
    if (!cjProductId) {
      return res.status(400).json({ success: false, message: 'cjProductId is required' });
    }

    const price = Number(customPrice) || 1299;
    const newProduct = store.addProduct({
      id: `cj-import-${Date.now()}`,
      name: `CJ ${cjProductId.toUpperCase()} - Wireless Fast Charging Pad 15W`,
      sku: `NK-CJ-${cjProductId.slice(-4).toUpperCase()}`,
      category: 'electronics',
      price,
      originalPrice: price * 1.6,
      discount: 38,
      rating: 4.7,
      reviewCount: 42,
      images: [
        'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Ultra-thin Qi-certified fast wireless charging pad with LED breathing indicator and foreign object detection.',
      highlights: ['15W Max Wireless Output', 'Qi Universal Compatibility', 'Anti-Slip Silicone Pad'],
      specifications: [
        { label: 'Input', value: 'USB-C 9V/2A' },
        { label: 'Output', value: '5W / 7.5W / 10W / 15W' },
        { label: 'Warranty', value: '6 Months Replacement' },
      ],
      variants: [{ id: 'var-col', name: 'Color', options: ['Matte Black', 'Pearl White'] }],
      stock: 75,
      tags: ['Wireless Charger', 'Dropship', 'Accessories'],
      shippingInfo: {
        estimatedDays: '3-4 Business Days',
        freeShippingAbove: 999,
        dispatchTime: 'Dispatched in 24 hours',
        courierPartners: ['BlueDart', 'Delhivery'],
      },
      returnPolicy: '7-day replacement guarantee',
      cjProductId,
    });

    res.status(201).json({
      success: true,
      message: `Product imported successfully from CJdropshipping (ID: ${cjProductId})`,
      product: newProduct,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
