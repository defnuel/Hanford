import { Project } from '../types';

export const SINGLE_REAL_PROJECT: Project = {
  id: 'proj-7inchesunder',
  slug: '7inchesunder',
  projectName: '7 Inches Under',
  projectType: 'Collaboration',
  partnerName: '7 Inches Under',
  xUsername: '@7inchesunder',
  location: 'Hanford Hotel Tokyo',
  date: 'Jan 2026',
  status: 'Active',
  description: 'Official collaboration project with 7 Inches Under (@7inchesunder).',
  detailsHtml: `
    <div>
      <h1>7 Inches Under</h1>
      <h4><em>Official Collaboration with Hanford Hotels & Resorts</em></h4>
      <p>Hanford Hotels & Resorts is proud to present our collaboration with 7 Inches Under (@7inchesunder).</p>
      <p>Discover updates, creative highlights, and official coverage directly on X:</p>
      <p style="margin-top: 16px;">
        <a href="https://x.com/7inchesunder/status/2038247095371792521?s=20" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; background-color: #510F23; color: #ffffff; border-radius: 9999px; font-weight: 600; text-decoration: none; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;">
          View Official Post on X (@7inchesunder)
        </a>
      </p>
    </div>
  `,
  heroImage: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1800&q=85',
  galleryImages: [
    'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1800&q=85'
  ]
};

export const MOCK_PROJECTS: Project[] = [SINGLE_REAL_PROJECT];
