import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  getPropertiesFromSource,
  getProjectsFromSource,
  getBookingsFromSource,
  appendBookingInquiry,
  appendSignatureOrderToSheet
} from './src/server/googleSheetsService';
import { sendTelegramBookingNotification, sendTelegramDiningNotification } from './src/server/telegramService';
import { generateInvoiceHtml } from './src/server/invoiceHtmlService';
import {
  findMatchingBookingForDining,
  generateSignatureReceiptHtml,
  signatureOrdersStore
} from './src/server/signatureReceiptService';
import { BookingInquiry, SignatureOrderPayload, SignatureOrderReceipt } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), 'public')));

  // ---------------------------------------------------------------------------
  // API ROUTES (Always placed BEFORE static/Vite middleware)
  // ---------------------------------------------------------------------------

  // Health & integration status diagnostic
  app.get('/api/health', (req: Request, res: Response) => {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const hasTelegramConfig = Boolean(
      process.env.TELEGRAM_BOT_TOKEN &&
      process.env.TELEGRAM_CHAT_ID
    );

    res.json({
      status: 'ok',
      brand: 'Hanford Hotels & Resorts',
      environment: process.env.NODE_ENV || 'development',
      integrations: {
        googleSheets: {
          configured: Boolean(spreadsheetId),
          spreadsheetId: spreadsheetId ? `${spreadsheetId.substring(0, 6)}...` : 'Not set',
          locationsTab: process.env.GOOGLE_SHEETS_LOCATIONS_TAB || 'Locations',
          projectsTab: process.env.GOOGLE_SHEETS_PROJECTS_TAB || 'Projects',
          bookingsTab: process.env.GOOGLE_SHEETS_BOOKINGS_TAB || 'Booking Requests'
        },
        googleDrive: {
          configured: Boolean(process.env.GOOGLE_DRIVE_API_KEY)
        },
        telegramBot: {
          configured: hasTelegramConfig,
          type: '100% Free Instant Alert'
        }
      }
    });
  });

  // GET /api/locations - Fetch all properties
  app.get('/api/locations', async (req: Request, res: Response) => {
    try {
      const result = await getPropertiesFromSource();
      res.json({
        success: true,
        data: result.properties,
        source: result.source,
        message: result.message,
        sheetInfo: {
          spreadsheetIdConfigured: result.spreadsheetIdConfigured,
          activeTab: process.env.GOOGLE_SHEETS_LOCATIONS_TAB || 'Locations'
        }
      });
    } catch (error: any) {
      console.error('Error in /api/locations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve locations data',
        details: error?.message
      });
    }
  });

  // GET /api/locations/:slug - Fetch individual property by slug
  app.get('/api/locations/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const result = await getPropertiesFromSource();
      const property = result.properties.find(
        (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
      );

      if (!property) {
        return res.status(404).json({
          success: false,
          error: `Property with slug '${slug}' not found.`
        });
      }

      res.json({
        success: true,
        data: property,
        source: result.source
      });
    } catch (error: any) {
      console.error(`Error in /api/locations/${req.params.slug}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve property details'
      });
    }
  });

  // GET /api/projects - Fetch all projects / collaborations
  app.get('/api/projects', async (req: Request, res: Response) => {
    try {
      const result = await getProjectsFromSource();
      res.json({
        success: true,
        data: result.projects,
        source: result.source,
        message: result.message,
        sheetInfo: {
          spreadsheetIdConfigured: result.spreadsheetIdConfigured,
          activeTab: process.env.GOOGLE_SHEETS_PROJECTS_TAB || 'Projects'
        }
      });
    } catch (error: any) {
      console.error('Error in /api/projects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve projects data',
        details: error?.message
      });
    }
  });

  // GET /api/projects/:slug - Fetch individual project by slug
  app.get('/api/projects/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const result = await getProjectsFromSource();
      const project = result.projects.find(
        (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
      );

      if (!project) {
        return res.status(404).json({
          success: false,
          error: `Project with slug '${slug}' not found.`
        });
      }

      res.json({
        success: true,
        data: project,
        source: result.source
      });
    } catch (error: any) {
      console.error(`Error in /api/projects/${req.params.slug}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve project details'
      });
    }
  });

  // GET /api/bookings - Fetch all booking inquiries from Google Sheets
  app.get('/api/bookings', async (req: Request, res: Response) => {
    try {
      const result = await getBookingsFromSource();
      res.json({
        success: true,
        data: result.bookings,
        source: result.source,
        message: result.message
      });
    } catch (error: any) {
      console.error('Error in /api/bookings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve bookings data',
        details: error?.message
      });
    }
  });

  // POST /api/book - Submit booking inquiry & trigger instant Telegram Bot alert
  app.post('/api/book', async (req: Request, res: Response) => {
    try {
      const payload: BookingInquiry = req.body;

      if (!payload.guestName || (!payload.propertySlug && !payload.propertyName)) {
        return res.status(400).json({
          success: false,
          error: 'Missing required booking parameters: Guest Name and Property Location are required.'
        });
      }

      // 1. Append booking inquiry to Google Sheet
      const response = await appendBookingInquiry(payload);
      if (!response.success) {
        return res.status(500).json({
          success: false,
          error: response.error || response.message || 'Gagal menyimpan booking ke Google Sheet.',
          details: response.message
        });
      }

      // 2. Trigger Instant Telegram Bot Alert Notification
      let telegramResult: any = null;
      try {
        const host = req.get('x-forwarded-host') || req.get('host');
        const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
        const baseUrl = `${protocol}://${host}`;
        telegramResult = await sendTelegramBookingNotification(payload, baseUrl);
      } catch (tErr: any) {
        console.warn('Telegram Notification Dispatch Warning:', tErr?.message);
        telegramResult = { success: false, error: tErr?.message };
      }

      res.status(201).json({
        ...response,
        telegramNotification: telegramResult
      });
    } catch (error: any) {
      console.error('Error in /api/book:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit booking inquiry to Google Sheet',
        details: error?.message || String(error)
      });
    }
  });

  // POST /api/telegram/test - Manually trigger a Telegram Bot alert test
  app.post('/api/telegram/test', async (req: Request, res: Response) => {
    try {
      const sampleBooking: BookingInquiry = req.body?.guestName ? req.body : {
        bookingId: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        guestName: 'Demo Guest',
        xUsername: '@guest_x',
        propertyName: 'Hanford Resort Bali',
        bookOption: 'room',
        checkInDate: '2026-09-01',
        checkOutDate: '2026-09-05',
        totalAmount: 1250,
        guestEmail: 'guest@example.com',
        guestPhone: '+628123456789'
      };

      const host = req.get('x-forwarded-host') || req.get('host');
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
      const baseUrl = `${protocol}://${host}`;

      const telegramResult = await sendTelegramBookingNotification(sampleBooking, baseUrl);
      res.json({
        success: telegramResult.success,
        message: telegramResult.message,
        details: telegramResult
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || String(error)
      });
    }
  });

  // GET /api/proxy-image - Proxy external images to eliminate CORS issues during canvas/PNG export
  app.get('/api/proxy-image', async (req: Request, res: Response) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl) {
        return res.status(400).send('Missing url parameter');
      }

      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });

      if (!response.ok) {
        return res.status(response.status).send('Failed to fetch remote image');
      }

      const contentType = response.headers.get('content-type') || 'image/png';
      const arrayBuffer = await response.arrayBuffer();

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error('Image proxy error:', err);
      res.status(500).send('Error proxying image');
    }
  });

  // GET /api/invoice/:bookingId? - Serve printable/downloadable Paid or Unpaid invoice HTML
  app.get(['/api/invoice/:bookingId', '/api/invoice'], async (req: Request, res: Response) => {
    try {
      const rawBookingId = req.params.bookingId || (req.query.id as string) || (req.query.bookingId as string) || 'TEST-8535';
      const statusParam = ((req.query.status as string) || 'UNPAID').toUpperCase() === 'PAID' ? 'PAID' : 'UNPAID';

      // Look up booking from Google Sheets / store or construct preview model
      const allBookingsRes = await getBookingsFromSource();
      const existingBooking = allBookingsRes.bookings.find(
        (b) => (b.bookingId || b.id || '').toLowerCase() === rawBookingId.toLowerCase()
      );

      const bookingToRender: BookingInquiry = existingBooking || {
        bookingId: rawBookingId,
        guestName: (req.query.guest as string) || 'Valued Guest',
        xUsername: (req.query.x as string) || '@guest',
        propertyName: (req.query.property as string) || 'Hanford Hotels & Resorts Sanctuary',
        propertySlug: 'hanford-sanctuary',
        bookOption: (req.query.type as any) || 'room',
        checkInDate: (req.query.checkIn as string) || '2026-09-01',
        checkOutDate: (req.query.checkOut as string) || '2026-09-05',
        totalAmount: req.query.total ? Number(req.query.total) : 1250,
        paymentStatus: statusParam
      };

      const htmlContent = generateInvoiceHtml(bookingToRender, statusParam);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(htmlContent);
    } catch (err: any) {
      console.error('Error serving invoice HTML:', err);
      res.status(500).send('<h1>Error generating invoice</h1><p>' + (err?.message || String(err)) + '</p>');
    }
  });

  // POST /api/hr-signature/verify-code - Verify X username against Google Sheets Bookings & Location
  app.post(['/api/hr-signature/verify-code', '/api/hf-signature/verify-code'], async (req: Request, res: Response) => {
    try {
      const { xUsername, propertySlug, propertyName } = req.body || {};

      if (!xUsername || !String(xUsername).trim()) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: 'Please enter your X username.'
        });
      }

      if (!propertySlug && !propertyName) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: 'Please select a property location first.'
        });
      }

      const bookingsRes = await getBookingsFromSource();
      const matched = findMatchingBookingForDining(
        bookingsRes.bookings,
        xUsername,
        propertySlug,
        propertyName
      );

      if (!matched) {
        return res.json({
          success: true,
          valid: false,
          message: 'No matching booking found for this X username at the selected property.'
        });
      }

      return res.json({
        success: true,
        valid: true,
        matchedBooking: matched,
        message: 'Guest verified — Free complimentary dining.'
      });
    } catch (err: any) {
      console.error('Error in /api/hr-signature/verify-code:', err);
      return res.status(500).json({
        success: false,
        valid: false,
        message: 'Unable to verify X username against bookings.'
      });
    }
  });

  // POST /api/hr-signature/order - Place HR Signature order & notify Telegram bot
  app.post(['/api/hr-signature/order', '/api/hf-signature/order'], async (req: Request, res: Response) => {
    try {
      const payload = req.body as SignatureOrderPayload;

      if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Order must contain at least one menu item.'
        });
      }

      if (!payload.propertySlug && !payload.propertyName) {
        return res.status(400).json({
          success: false,
          error: 'Property location is required.'
        });
      }

      const subtotal = payload.items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
      const taxAmount = Math.round(subtotal * 0.1);

      let matchedBooking = null;
      if (payload.xUsernameCode && payload.xUsernameCode.trim()) {
        const bookingsRes = await getBookingsFromSource();
        matchedBooking = findMatchingBookingForDining(
          bookingsRes.bookings,
          payload.xUsernameCode,
          payload.propertySlug,
          payload.propertyName
        );
      }

      // Free complimentary when guest confirms they are a Hotel Guest (matching booking verified or hotel guest status)
      const isFreeDining = Boolean(payload.isHotelGuest) || Boolean(matchedBooking);
      const grossTotal = subtotal + taxAmount;
      const discountAmount = isFreeDining ? grossTotal : 0;
      const totalAmount = isFreeDining ? 0 : grossTotal;

      const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
      const orderId = `HRS-2026-${randomHex}`;

      const resolvedGuestName =
        (payload.guestName && payload.guestName.trim()) ||
        (matchedBooking?.guestName) ||
        (payload.xUsernameCode ? `@${payload.xUsernameCode.replace(/^@+/, '')}` : 'Guest');

      const receipt: SignatureOrderReceipt = {
        orderId,
        createdAt: new Date().toISOString(),
        propertySlug: payload.propertySlug,
        propertyName: payload.propertyName || payload.propertySlug,
        serviceType: payload.serviceType === 'room_service' ? 'room_service' : 'restaurant',
        isHotelGuest: isFreeDining,
        guestName: resolvedGuestName,
        roomOrTable: payload.serviceType === 'room_service' ? (payload.roomOrTable?.trim() || undefined) : undefined,
        xUsernameCode: payload.xUsernameCode?.trim() || undefined,
        isFreeDining,
        matchedBooking,
        items: payload.items,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        notes: payload.notes?.trim() || undefined
      };

      signatureOrdersStore.set(orderId, receipt);

      let sheetSync: any = null;
      try {
        sheetSync = await appendSignatureOrderToSheet(receipt);
      } catch (sErr: any) {
        console.warn('Google Sheet HR Signature sync warning:', sErr?.message);
        sheetSync = { success: false, source: 'memory_fallback', error: sErr?.message };
      }

      let telegramResult: any = null;
      try {
        const host = req.get('x-forwarded-host') || req.get('host');
        const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
        const baseUrl = `${protocol}://${host}`;
        telegramResult = await sendTelegramDiningNotification(receipt, baseUrl);
      } catch (tErr: any) {
        console.warn('Telegram dining alert warning:', tErr?.message);
        telegramResult = { success: false, error: tErr?.message };
      }

      return res.status(201).json({
        success: true,
        receipt,
        sheetSync,
        telegramNotification: telegramResult
      });
    } catch (err: any) {
      console.error('Error in /api/hr-signature/order:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to place HR Signature order.',
        details: err?.message || String(err)
      });
    }
  });

  // GET /api/hr-signature/receipt/:orderId - Serve printable HTML receipt linked from Telegram
  app.get(['/api/hr-signature/receipt/:orderId', '/api/hf-signature/receipt/:orderId'], (req: Request, res: Response) => {
    const { orderId } = req.params;
    const stored = signatureOrdersStore.get(orderId);

    if (!stored) {
      return res.status(404).send(`
        <html><body style="font-family:sans-serif;padding:40px;color:#2C3744;">
          <h2 style="color:#3A4F67;">HR Signature Receipt #${String(orderId).replace(/[<>&"]/g, '')}</h2>
          <p>This receipt session is no longer stored in memory. Please download the PNG receipt directly from the HR Signature confirmation page.</p>
        </body></html>
      `);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(generateSignatureReceiptHtml(stored));
  });

  // ---------------------------------------------------------------------------
  // VITE DEV / PRODUCTION STATIC SERVER MIDDLEWARE
  // ---------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Hanford Hotels & Resorts] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
