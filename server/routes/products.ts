import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET /api/products - list & filter
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, minRating, inStockOnly, sortBy } = req.query;

    const products = store.getProducts({
      category: category as string,
      search: search as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      inStockOnly: inStockOnly === 'true',
      sortBy: sortBy as string,
    });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id - single product detail
router.get('/:id', (req: Request, res: Response) => {
  try {
    const product = store.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products - create/import dropshipped product
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, category, price, originalPrice, stock, description, images, sku } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }

    const newProd = store.addProduct({
      id: `prod-cj-${Date.now()}`,
      name,
      sku: sku || `NK-CJ-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price) * 1.5,
      discount: Math.round(((Number(originalPrice || price * 1.5) - Number(price)) / Number(originalPrice || price * 1.5)) * 100),
      rating: 4.5,
      reviewCount: 1,
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
      description: description || 'High-grade dropshipped item with verified supplier sourcing.',
      highlights: ['Direct CJdropshipping verified inventory', 'Pan-India Express Dispatch', '7-Day Replacement Policy'],
      specifications: [{ label: 'Origin', value: 'Direct Sourced' }, { label: 'Quality Check', value: 'Passed 5-Point QA' }],
      variants: [{ id: 'var-default', name: 'Option', options: ['Standard'] }],
      stock: Number(stock) || 50,
      tags: ['Dropship', 'Trending', category],
      shippingInfo: {
        estimatedDays: '3-5 Business Days',
        freeShippingAbove: 999,
        dispatchTime: 'Dispatched in 24 hours',
        courierPartners: ['BlueDart', 'Delhivery'],
      },
      returnPolicy: '7-day replacement guarantee',
      cjProductId: req.body.cjProductId || `CJ-PROD-${Math.floor(10000 + Math.random() * 90000)}`,
    });

    res.status(201).json({ success: true, product: newProd });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id - update price, stock, or active status
router.put('/:id', (req: Request, res: Response) => {
  try {
    const updated = store.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
