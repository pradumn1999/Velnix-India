import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { OrderStatus } from '../../src/types';

const router = Router();

// GET /api/orders - list orders
router.get('/', (req: Request, res: Response) => {
  try {
    const isAdmin = req.query.role === 'admin';
    const customerEmail = isAdmin ? undefined : String(req.query.email || '').trim();
    if (!isAdmin && !customerEmail) {
      return res.status(400).json({ success: false, message: 'Customer email is required.' });
    }
    const orders = store.getOrders(customerEmail);
    res.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id - single order details
router.get('/:id', (req: Request, res: Response) => {
  try {
    const isAdmin = req.query.role === 'admin';
    const order = store.getOrderById(req.params.id);
    if (!isAdmin && (!req.query.email || order?.customerEmail?.toLowerCase() !== String(req.query.email).trim().toLowerCase())) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders - create new order
router.post('/', (req: Request, res: Response) => {
  try {
    const { customerEmail, items, subtotal, shipping, discount, totalAmount, paymentMethod, paymentStatus, shippingAddress } = req.body;

    if (!customerEmail || !items || !items.length || !shippingAddress) {
      return res.status(400).json({ success: false, message: 'Customer email, order items, and shipping address are required.' });
    }

    const newOrder = store.createOrder({
      customerEmail: String(customerEmail),
      items,
      subtotal: Number(subtotal) || 0,
      shipping: Number(shipping) || 0,
      discount: Number(discount) || 0,
      totalAmount: Number(totalAmount) || 0,
      paymentMethod,
      paymentStatus,
      shippingAddress,
    });

    res.status(201).json({ success: true, order: newOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/orders/:id/status - update order status
router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    if (req.query.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access is required.' });
    }
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updated = store.updateOrderStatus(req.params.id, status as OrderStatus);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
