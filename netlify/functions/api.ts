import express, { Request, Response } from 'express';
import { getPropertiesFromSource, appendBookingInquiry } from '../../src/server/googleSheetsService';
import { BookingInquiry } from '../../src/types';

/**
 * Netlify Function adapter for Hanford Hotels & Resorts API routes.
 * Exposes serverless endpoints for:
 *  - GET /.netlify/functions/api/locations
 *  - GET /.netlify/functions/api/locations/:slug
 *  - POST /.netlify/functions/api/book
 */
const app = express();
app.use(express.json());

app.get('/.netlify/functions/api/locations', async (req: Request, res: Response) => {
  try {
    const result = await getPropertiesFromSource();
    res.json({ success: true, data: result.properties, source: result.source });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.get('/.netlify/functions/api/locations/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const result = await getPropertiesFromSource();
    const property = result.properties.find(p => p.slug === slug || p.id === slug);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    res.json({ success: true, data: property, source: result.source });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/.netlify/functions/api/book', async (req: Request, res: Response) => {
  try {
    const payload: BookingInquiry = req.body;
    const response = await appendBookingInquiry(payload);
    res.status(201).json(response);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

export default app;
