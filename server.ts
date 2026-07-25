import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getPropertiesFromSource, getProjectsFromSource, appendBookingInquiry } from './src/server/googleSheetsService';
import { BookingInquiry } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ---------------------------------------------------------------------------
  // API ROUTES (Always placed BEFORE static/Vite middleware)
  // ---------------------------------------------------------------------------

  // Health & integration status diagnostic
  app.get('/api/health', (req: Request, res: Response) => {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
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

  // POST /api/book - Submit booking inquiry
  app.post('/api/book', async (req: Request, res: Response) => {
    try {
      const payload: BookingInquiry = req.body;

      if (!payload.guestName || !payload.xUsername || (!payload.propertySlug && !payload.propertyName)) {
        return res.status(400).json({
          success: false,
          error: 'Missing required booking parameters: Name, X Username, and Location are required.'
        });
      }

      const response = await appendBookingInquiry(payload);
      res.status(201).json(response);
    } catch (error: any) {
      console.error('Error in /api/book:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit booking inquiry'
      });
    }
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
