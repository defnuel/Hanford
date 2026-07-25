import { Property, RawGoogleSheetsPropertyRow } from '../types';

export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const MOCK_RAW_GOOGLE_SHEETS_DATA: RawGoogleSheetsPropertyRow[] = [
  {
    Name: 'Hanford Eco Resort Jeju',
    Tagline: 'A Coastal Sanctuary Inspired by Jeju’s Natural Beauty',
    Address: '152 Taepyeong-ro, Seogwipo-si, Jeju-do 63571',
    Country: 'South Korea',
    Continent: 'Asia',
    Status: 'Live',
    Details: `<div><h1>Hanford Eco Resort Jeju</h1> <h4><em><strong>Modern design amid Korea’s natural wonders</strong></em></h4> </div> <div data-maxchar="250"> <p>A vision of contemporary Korean luxury, Hanford Eco Resort Jeju stretches across the southern cliffs of Jeju, offering a back-to-nature experience on South Korea’s famed volcanic island.</p> <p>With its clean architectural lines and sun-drenched gardens, the low-lying resort blends seamlessly into the dramatic landscape. Inside, renowned interior designer Bill Bensley worked his magic to unveil a <em>hanok</em>-inspired lobby and relaxing rooms featuring sunny hues, light wood and natural stone.</p> <p>From world-class wellness to family fun, do as much — or a little — as you please. Indulge in an organic treatment at the Hanford Spa, take a dip in the expansive infinity pool and practice sun salutations with views of the East China Sea. When hunger strikes, savor wood-fired barbecue at The Flying Hog or lavish brunches at Island Kitchen.</p> <div> <h3><strong>Highlights</strong></h3> <div> <ul> <li>Jeju is a UNESCO Biosphere Reserve and World Natural Heritage Site, celebrating nature at every opportunity in its breezy clifftop setting and lush gardens.</li> <li>Spacious accommodations starting at 463 sq ft with bathrooms designed like mini <em>jjimjilbang</em> (Korean bathhouses) with gigantic marble soaking tubs.</li> <li>Stone-clad Hanford Spa with relaxation lounges, indoor lap pool, sunken Jacuzzi, fitness center, yoga studio, and natural hot spring access.</li> <li>Wood-fired dining at The Flying Hog and intimate omakase seafood at Yeoumul.</li> <li>Outdoor infinity pool flowing toward the sea, with direct access to the Jeju Olle Trail Route 7.</li> </ul> </div> </div> <div> <h3><strong>Amenities</strong></h3> <div> <ul> <li>24-hour room service</li> <li>Bar</li> <li>Fitness classes</li> <li>Gym</li> <li>House car</li> <li>Meeting rooms</li> <li>Outdoor pool</li> <li>Restaurants</li> <li>Spa</li> </ul> </div> </div> </div>`,
    "Picture's folder": 'https://drive.google.com/drive/folders/1g6zZumDdT-7AxEYmWck_qDIBx3OI5ywC?usp=drive_link',
    Source: 'https://www.forbestravelguide.com/hotels/jeju-island-south-korea/jw-marriott-jeju-resort-spa'
  },
  {
    Name: 'Hanford Eco Resort Santa Barbara',
    Tagline: "Oceanfront elegance on California's Central Coast",
    Address: '8301 Hollister Avenue, Santa Barbara, CA 93117',
    Country: 'United States',
    Continent: 'America',
    Status: 'Live',
    Details: `<div><h1>Hanford Eco Resort Santa Barbara</h1> <h4><em><strong>Modern design amid California’s natural wonders</strong></em></h4> </div> <div data-maxchar="250"> <p>Ideally located on 78 beachfront acres with the vast Pacific Ocean displayed before you, Hanford Eco Resort Santa Barbara is quintessential California coastal luxury. Designed as a Spanish village with winding paths and white stucco walls capped with red tiled roofs, the resort evokes Santa Barbara’s Spanish heritage with modern comforts.</p> <p>Originally a Chumash Indian settlement, the resort features 358 rooms and suites, five restaurants and one of the largest spas on California’s Central Coast.</p> <div> <h3><strong>Highlights</strong></h3> <div> <ul> <li>Every accommodation boasts a balcony or patio taking in wild jasmine and cool ocean breezes.</li> <li>Three zero-edge, 82-degree saline pools with beach vistas and plush poolside cabanas.</li> <li>Massive 42,000 sq ft spa with 36 treatment rooms and a serene rooftop oceanview terrace.</li> <li>Scenic Angel Oak steakhouse with a 12,000-bottle wine cellar and Hanford Tasting Room.</li> <li>Fragrant Chumash Nature Trail leading directly down to the beach.</li> </ul> </div> </div> <div> <h3><strong>Amenities</strong></h3> <div> <ul> <li>24-hour room service</li> <li>Babysitting services</li> <li>Bar</li> <li>Beach</li> <li>Fitness classes</li> <li>Golf</li> <li>Gym</li> <li>Meeting rooms</li> <li>Outdoor pool</li> <li>Pet friendly</li> <li>Restaurants</li> <li>Spa</li> <li>Tennis</li> </ul> </div> </div> </div>`,
    "Picture's folder": 'https://drive.google.com/drive/folders/1Q1UTePq-2qfWGOdraL5XCj8NBf9qyCJo?usp=drive_link',
    Source: 'https://www.forbestravelguide.com/hotels/santa-barbara-california/the-ritz-carlton-bacara-santa-barbara'
  },
  {
    Name: 'Hanford Eco Resort Santorini',
    Tagline: 'Sustainable Luxury Meets Greek Aegean Hideaway',
    Address: 'Oia Coastal Road, Oia 847 02, Santorini',
    Country: 'Greece',
    Continent: 'Europe',
    Status: 'Live',
    Details: `<div><h1>Hanford Eco Resort Santorini</h1> <h4><em><strong>Modern design amid Greece’s natural wonders</strong></em></h4> </div> <div data-maxchar="250"> <p>Cascading down a mountainside on Santorini’s eastern coast, this 66-room luxury property offers cubic silhouettes, natural stone accents, and whitewashed walls perfectly suited to the windswept landscape.</p> <p>A crescent-shaped infinity pool forms the social heart, while rooms feature private terraces and thoughtful touches throughout. Nectar restaurant showcases contemporary cuisine paired with indigenous wines.</p> <div> <h3><strong>Highlights</strong></h3> <div> <ul> <li>66 spacious accommodations with nearly half featuring private plunge pools.</li> <li>Design led by the Rockwell Group balancing local Greek craftsmanship with international luxury.</li> <li>Trio of pools including an indoor thermal spa pool.</li> <li>Private beach section with reserved sunbeds, umbrellas, and shuttle service.</li> <li>Dedicated kids club and family-friendly configured villas.</li> </ul> </div> </div> <div> <h3><strong>Amenities</strong></h3> <div> <ul> <li>24-hour room service</li> <li>Bar</li> <li>Fitness classes</li> <li>Gym</li> <li>House car</li> <li>Meeting rooms</li> <li>Indoor pool</li> <li>Outdoor pool</li> <li>Restaurants</li> <li>Spa</li> <li>Babysitting services</li> <li>Beach</li> <li>Kids Club</li> <li>Pet friendly</li> </ul> </div> </div> </div>`,
    "Picture's folder": 'https://drive.google.com/drive/folders/1Q1UTePq-2qfWGOdraL5XCj8NBf9qyCJo?usp=drive_link',
    Source: 'https://www.forbestravelguide.com/hotels/santorini-greece/sandblu-santorini-lxr-hotels-resorts'
  },
  {
    Name: 'Hanford Grand Hotel Jakarta',
    Tagline: 'International Luxury with an Indonesian Touch',
    Address: 'Jl. Jenderal Sudirman No.Kav. 87, Kota Jakarta Pusat, DKI Jakarta 10220',
    Country: 'Indonesia',
    Continent: 'Asia',
    Status: 'Live',
    Details: `<div><h1>Hanford Grand Hotel Jakarta</h1> <h4><em>International luxury with an Indonesian touch</em></h4> </div> <div data-maxchar="250"> <p>Elegantly perched in the center of Indonesia’s Golden Triangle business district, Hanford Grand Hotel Jakarta offers a stylish interpretation of Jakarta’s rich history with world-class dining, bespoke batiks, and hand-dyed fabrics.</p> <div> <h3><strong>Highlights</strong></h3> <div> <ul> <li>Nightly champagne sabering ceremony and "Sound of Light" lobby show.</li> <li>Bel Étage serving Indonesian classics like beef rendang and mie goreng.</li> <li>Classic Hanford afternoon tea in The Drawing Room with live piano performance.</li> <li>Secluded outdoor swimming pool designed by Bill Bensley amidst lush foliage.</li> <li>Hanford Grand Bar featuring local batik murals and signature Batavia Mary cocktails.</li> </ul> </div> </div> <div> <h3><strong>Amenities</strong></h3> <div> <ul> <li>24-hour room service</li> <li>Bar</li> <li>Fitness classes</li> <li>Gym</li> <li>House car</li> <li>Meeting rooms</li> <li>Outdoor pool</li> <li>Restaurants</li> <li>Spa</li> </ul> </div> </div> </div>`,
    "Picture's folder": 'https://drive.google.com/drive/folders/1DHgCe8dVvamYC1e4b3xvkQ58AEFd_CAc?usp=drive_link',
    Source: 'https://www.forbestravelguide.com/hotels/jakarta-indonesia/the-st-regis-jakarta'
  },
  {
    Name: 'Hanford Grand Hotel Seoul',
    Tagline: 'Seoul’s Icon of Timeless Elegance and Modern Luxury',
    Address: '12 Saemunan-ro, Jongno-gu, Seoul 03184',
    Country: 'South Korea',
    Continent: 'Asia',
    Status: 'Live',
    Details: `<div><h1>Hanford Grand Hotel Seoul</h1> <h4><em><strong>Seoul’s Icon of Timeless Elegance and Modern Luxury</strong></em></h4> </div> <div data-maxchar="250"> <p>Towering above the elite district from Lotte World Tower, Hanford Grand Hotel Seoul affords panoramic vistas of South Korea’s capital from floor-to-ceiling windows, 85th-floor sky pools, and award-winning dining venues.</p> <div> <h3><strong>Highlights</strong></h3> <div> <ul> <li>Signature welcome tea upon arrival on the sky-high lobby floors.</li> <li>Exclusive Salon de Hanford library lounge with panoramic city views.</li> <li>Hydration-focused treatments at Hanford Spa.</li> <li>81st-floor Hanford STAY fine French dining and Bicena contemporary Korean gastronomy.</li> <li>Dramatic Hanford Bar featuring Korea’s largest champagne collection.</li> </ul> </div> </div> <div> <h3><strong>Amenities</strong></h3> <div> <ul> <li>24-hour room service</li> <li>Bar</li> <li>Fitness classes</li> <li>Gym</li> <li>House car</li> <li>Indoor pool</li> <li>Meeting rooms</li> <li>Restaurants</li> <li>Spa</li> </ul> </div> </div> </div>`,
    "Picture's folder": 'https://drive.google.com/drive/folders/1xKmc3yYGh1nhQ5fcDReImXiWumhWOPyk?usp=drive_link',
    Source: 'https://www.forbestravelguide.com/hotels/seoul-south-korea/signiel-seoul'
  },
  {
    Name: 'Hanford Eco Resort Key Largo',
    Tagline: 'An Island Escape into Nature and Luxury',
    Address: '98000 Overseas Highway, Key Largo, FL 33037',
    Country: 'United States',
    Continent: 'America',
    Status: 'Coming Soon',
    Details: '<p>Sanctuary currently under architectural development in the Florida Keys. Reservations opening soon.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Eco Resort Kuta',
    Tagline: 'Tropical Luxury in Harmony with Nature',
    Address: 'Jalan Raya Kuta, Kuta, Badung, Bali 80361',
    Country: 'Indonesia',
    Continent: 'Asia',
    Status: 'Coming Soon',
    Details: '<p>A coastal paradise in Bali currently under design. Opening date to be announced shortly.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Eco Resort Lombok',
    Tagline: 'Where Tropical Forests Meet the Sea',
    Address: 'Jalan Senggigi, Senggigi, Lombok Barat, Nusa Tenggara Barat 83355',
    Country: 'Indonesia',
    Continent: 'Asia',
    Status: 'Coming Soon',
    Details: '<p>Exclusive beachfront villas coming soon to the pristine coast of Lombok.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Eco Resort Maui',
    Tagline: 'Where Luxury Meets the Spirit of Aloha',
    Address: '3900 Wailea Alanui Drive, Wailea, HI 96753',
    Country: 'United States',
    Continent: 'America',
    Status: 'Coming Soon',
    Details: '<p>A serene Hawaiian sanctuary situated along Wailea Beach. Opening coming soon.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Eco Resort Nusa Dua',
    Tagline: 'A Sanctuary of Tropical Luxury and Wellness',
    Address: 'Kawasan Pariwisata Nusa Dua, Nusa Dua, Bali 80361',
    Country: 'Indonesia',
    Continent: 'Asia',
    Status: 'Coming Soon',
    Details: '<p>Holistic wellness retreat amidst Balinese gardens. Coming soon.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Grand Hotel & Resort British Columbia',
    Tagline: 'Luxury at the Edge of the Pacific',
    Address: '900 Canada Place Way, Vancouver, British Columbia V6C 3L5',
    Country: 'Canada',
    Continent: 'America',
    Status: 'Coming Soon',
    Details: '<p>Pacific Northwest luxury property coming soon to British Columbia.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Grand Hotel London',
    Tagline: 'Timeless British Elegance in the Heart of London',
    Address: '25 Grosvenor Square, Mayfair, London W1K 6JP',
    Country: 'United Kingdom',
    Continent: 'Europe',
    Status: 'Coming Soon',
    Details: '<p>Regency townhouse restoration in Mayfair Square. Opening date approaching.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Grand Hotel Melbourne',
    Tagline: 'Contemporary Luxury with a European Soul',
    Address: '1 Parliament Place, East Melbourne VIC 3002',
    Country: 'Australia',
    Continent: 'Australia',
    Status: 'Coming Soon',
    Details: '<p>An Australian flagship urban hotel bringing European elegance to Melbourne.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Grand Hotel Montreal',
    Tagline: 'European Elegance in the Heart of Québec',
    Address: '1000 Place Jean-Paul-Riopelle, Montréal, Québec H2Z 2B3',
    Country: 'Canada',
    Continent: 'America',
    Status: 'Coming Soon',
    Details: '<p>A historic boutique property in French Canada under development.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Grand Hotel New York',
    Tagline: 'Timeless Sophistication in the Heart of Manhattan',
    Address: '725 Fifth Avenue, New York, NY 10022',
    Country: 'United States',
    Continent: 'America',
    Status: 'Coming Soon',
    Details: '<p>Fifth Avenue landmark property bringing refined luxury to NYC. Opening soon.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Grand Hotel Singapore',
    Tagline: 'Modern Luxury Overlooking Marina Bay',
    Address: '8 Marina Boulevard, Marina Bay, Singapore 018981',
    Country: 'Singapore',
    Continent: 'Asia',
    Status: 'Coming Soon',
    Details: '<p>Sanctuary overlooking Marina Bay under architectural construction.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Grand Hotel Sydney',
    Tagline: 'Grand Luxury on Sydney Harbour',
    Address: '1 Macquarie Street, Sydney NSW 2000',
    Country: 'Australia',
    Continent: 'Australia',
    Status: 'Coming Soon',
    Details: '<p>Harbourfront sanctuary facing the Sydney Opera House. Opening soon.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Grand Hotel Vancouver',
    Tagline: 'Timeless Elegance on Canada’s Pacific Coast',
    Address: '1055 Canada Place, Vancouver, BC V6C 0C3',
    Country: 'Canada',
    Continent: 'America',
    Status: 'Coming Soon',
    Details: '<p>Coastal Canadian hotel under development.</p>',
    "Picture's folder": ''
  },
  {
    Name: 'Hanford Hotel & Resort Lake Como',
    Tagline: 'An Escape into Italian Lakeside Luxury',
    Address: 'Via Regina 40, 22012 Cernobbio, Lake Como, Italy',
    Country: 'Italy',
    Continent: 'Europe',
    Status: 'Coming Soon',
    Details: '<p>Lakeside villa property in Cernobbio opening soon.</p>',
    "Picture's folder": ''
  }
];

const RAW_PROPERTIES_DATA: Property[] = [
  {
    id: 'prop-jeju',
    slug: 'hanford-eco-resort-jeju',
    name: 'Hanford Eco Resort Jeju',
    tagline: 'A Coastal Sanctuary Inspired by Jeju’s Natural Beauty',
    address: '152 Taepyeong-ro, Seogwipo-si, Jeju-do 63571',
    country: 'South Korea',
    continent: 'Asia',
    status: 'Live',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[0].Details,
    driveFolderUrl: 'https://drive.google.com/drive/folders/1g6zZumDdT-7AxEYmWck_qDIBx3OI5ywC?usp=drive_link',
    heroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528164344705-475426879e0d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    priceFrom: 1200,
    rating: 4.97,
    amenities: ['24-hour room service', 'Bar', 'Fitness classes', 'Gym', 'House car', 'Meeting rooms', 'Outdoor pool', 'Restaurants', 'Spa']
  },
  {
    id: 'prop-santa-barbara',
    slug: 'hanford-eco-resort-santa-barbara',
    name: 'Hanford Eco Resort Santa Barbara',
    tagline: "Oceanfront elegance on California's Central Coast",
    address: '8301 Hollister Avenue, Santa Barbara, CA 93117',
    country: 'United States',
    continent: 'America',
    status: 'Live',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[1].Details,
    driveFolderUrl: 'https://drive.google.com/drive/folders/1Q1UTePq-2qfWGOdraL5XCj8NBf9qyCJo?usp=drive_link',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80'
    ],
    priceFrom: 1450,
    rating: 4.98,
    amenities: ['24-hour room service', 'Babysitting services', 'Bar', 'Beach', 'Fitness classes', 'Golf', 'Gym', 'Meeting rooms', 'Outdoor pool', 'Pet friendly', 'Restaurants', 'Spa', 'Tennis']
  },
  {
    id: 'prop-santorini',
    slug: 'hanford-eco-resort-santorini',
    name: 'Hanford Eco Resort Santorini',
    tagline: 'Sustainable Luxury Meets Greek Aegean Hideaway',
    address: 'Oia Coastal Road, Oia 847 02, Santorini',
    country: 'Greece',
    continent: 'Europe',
    status: 'Live',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[2].Details,
    driveFolderUrl: 'https://drive.google.com/drive/folders/1Q1UTePq-2qfWGOdraL5XCj8NBf9qyCJo?usp=drive_link',
    heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    ],
    priceFrom: 1650,
    rating: 4.99,
    amenities: ['24-hour room service', 'Bar', 'Fitness classes', 'Gym', 'House car', 'Meeting rooms', 'Indoor pool', 'Outdoor pool', 'Restaurants', 'Spa', 'Babysitting services', 'Beach', 'Kids Club', 'Pet friendly']
  },
  {
    id: 'prop-jakarta',
    slug: 'hanford-grand-hotel-jakarta',
    name: 'Hanford Grand Hotel Jakarta',
    tagline: 'International Luxury with an Indonesian Touch',
    address: 'Jl. Jenderal Sudirman No.Kav. 87, Kota Jakarta Pusat, DKI Jakarta 10220',
    country: 'Indonesia',
    continent: 'Asia',
    status: 'Live',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[3].Details,
    driveFolderUrl: 'https://drive.google.com/drive/folders/1DHgCe8dVvamYC1e4b3xvkQ58AEFd_CAc?usp=drive_link',
    heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80'
    ],
    priceFrom: 950,
    rating: 4.96,
    amenities: ['24-hour room service', 'Bar', 'Fitness classes', 'Gym', 'House car', 'Meeting rooms', 'Outdoor pool', 'Restaurants', 'Spa']
  },
  {
    id: 'prop-seoul',
    slug: 'hanford-grand-hotel-seoul',
    name: 'Hanford Grand Hotel Seoul',
    tagline: 'Seoul’s Icon of Timeless Elegance and Modern Luxury',
    address: '12 Saemunan-ro, Jongno-gu, Seoul 03184',
    country: 'South Korea',
    continent: 'Asia',
    status: 'Live',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[4].Details,
    driveFolderUrl: 'https://drive.google.com/drive/folders/1xKmc3yYGh1nhQ5fcDReImXiWumhWOPyk?usp=drive_link',
    heroImage: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80'
    ],
    priceFrom: 1850,
    rating: 4.99,
    amenities: ['24-hour room service', 'Bar', 'Fitness classes', 'Gym', 'House car', 'Indoor pool', 'Meeting rooms', 'Restaurants', 'Spa']
  },
  {
    id: 'prop-key-largo',
    slug: 'hanford-eco-resort-key-largo',
    name: 'Hanford Eco Resort Key Largo',
    tagline: 'An Island Escape into Nature and Luxury',
    address: '98000 Overseas Highway, Key Largo, FL 33037',
    country: 'United States',
    continent: 'America',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[5].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 1100,
    rating: 4.9,
    amenities: ['Island Spa', 'Private Marina', 'Eco Tours']
  },
  {
    id: 'prop-kuta',
    slug: 'hanford-eco-resort-kuta',
    name: 'Hanford Eco Resort Kuta',
    tagline: 'Tropical Luxury in Harmony with Nature',
    address: 'Jalan Raya Kuta, Kuta, Badung, Bali 80361',
    country: 'Indonesia',
    continent: 'Asia',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[6].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 850,
    rating: 4.9,
    amenities: ['Surf Club', 'Beachfront Pool', 'Balinese Spa']
  },
  {
    id: 'prop-lombok',
    slug: 'hanford-eco-resort-lombok',
    name: 'Hanford Eco Resort Lombok',
    tagline: 'Where Tropical Forests Meet the Sea',
    address: 'Jalan Senggigi, Senggigi, Lombok Barat, Nusa Tenggara Barat 83355',
    country: 'Indonesia',
    continent: 'Asia',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[7].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 900,
    rating: 4.92,
    amenities: ['Forest Villas', 'Diving Center', 'Thermal Springs']
  },
  {
    id: 'prop-maui',
    slug: 'hanford-eco-resort-maui',
    name: 'Hanford Eco Resort Maui',
    tagline: 'Where Luxury Meets the Spirit of Aloha',
    address: '3900 Wailea Alanui Drive, Wailea, HI 96753',
    country: 'United States',
    continent: 'America',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[8].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 1700,
    rating: 4.95,
    amenities: ['Wailea Beach Frontage', 'Luau Pavilion', 'Kaanapali Golf']
  },
  {
    id: 'prop-nusa-dua',
    slug: 'hanford-eco-resort-nusa-dua',
    name: 'Hanford Eco Resort Nusa Dua',
    tagline: 'A Sanctuary of Tropical Luxury and Wellness',
    address: 'Kawasan Pariwisata Nusa Dua, Nusa Dua, Bali 80361',
    country: 'Indonesia',
    continent: 'Asia',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[9].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 1150,
    rating: 4.93,
    amenities: ['Private Beach Club', 'Ayurvedic Center', 'Yoga Lawn']
  },
  {
    id: 'prop-bc',
    slug: 'hanford-grand-hotel-resort-british-columbia',
    name: 'Hanford Grand Hotel & Resort British Columbia',
    tagline: 'Luxury at the Edge of the Pacific',
    address: '900 Canada Place Way, Vancouver, British Columbia V6C 3L5',
    country: 'Canada',
    continent: 'America',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[10].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 1300,
    rating: 4.91,
    amenities: ['Harbourview Suites', 'Pacific Dining', 'Helipad Access']
  },
  {
    id: 'prop-london',
    slug: 'hanford-grand-hotel-london',
    name: 'Hanford Grand Hotel London',
    tagline: 'Timeless British Elegance in the Heart of London',
    address: '25 Grosvenor Square, Mayfair, London W1K 6JP',
    country: 'United Kingdom',
    continent: 'Europe',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[11].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 1950,
    rating: 4.96,
    amenities: ['Grosvenor Square Views', 'Butler Service', 'Whisky Bar']
  },
  {
    id: 'prop-melbourne',
    slug: 'hanford-grand-hotel-melbourne',
    name: 'Hanford Grand Hotel Melbourne',
    tagline: 'Contemporary Luxury with a European Soul',
    address: '1 Parliament Place, East Melbourne VIC 3002',
    country: 'Australia',
    continent: 'Australia',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[12].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 1050,
    rating: 4.92,
    amenities: ['Rooftop Conservatory', 'Wine Cellar', 'Heritage Gardens']
  },
  {
    id: 'prop-montreal',
    slug: 'hanford-grand-hotel-montreal',
    name: 'Hanford Grand Hotel Montreal',
    tagline: 'European Elegance in the Heart of Québec',
    address: '1000 Place Jean-Paul-Riopelle, Montréal, Québec H2Z 2B3',
    country: 'Canada',
    continent: 'America',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[13].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1519178612-6846979c9535?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 1100,
    rating: 4.9,
    amenities: ['French Dining', 'Nordic Spa', 'Art Gallery']
  },
  {
    id: 'prop-new-york',
    slug: 'hanford-grand-hotel-new-york',
    name: 'Hanford Grand Hotel New York',
    tagline: 'Timeless Sophistication in the Heart of Manhattan',
    address: '725 Fifth Avenue, New York, NY 10022',
    country: 'United States',
    continent: 'America',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[14].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 2100,
    rating: 4.97,
    amenities: ['Fifth Avenue Entrance', 'Central Park Terrace', 'Private Jazz Lounge']
  },
  {
    id: 'prop-singapore',
    slug: 'hanford-grand-hotel-singapore',
    name: 'Hanford Grand Hotel Singapore',
    tagline: 'Modern Luxury Overlooking Marina Bay',
    address: '8 Marina Boulevard, Marina Bay, Singapore 018981',
    country: 'Singapore',
    continent: 'Asia',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[15].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 1750,
    rating: 4.96,
    amenities: ['Sky Garden Infinity Pool', 'Michelin Cantonese', 'Marina Views']
  },
  {
    id: 'prop-sydney',
    slug: 'hanford-grand-hotel-sydney',
    name: 'Hanford Grand Hotel Sydney',
    tagline: 'Grand Luxury on Sydney Harbour',
    address: '1 Macquarie Street, Sydney NSW 2000',
    country: 'Australia',
    continent: 'Australia',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[16].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 1600,
    rating: 4.94,
    amenities: ['Opera House Panorama', 'Private Yacht Dock', 'Harbour Spa']
  },
  {
    id: 'prop-vancouver',
    slug: 'hanford-grand-hotel-vancouver',
    name: 'Hanford Grand Hotel Vancouver',
    tagline: 'Timeless Elegance on Canada’s Pacific Coast',
    address: '1055 Canada Place, Vancouver, BC V6C 0C3',
    country: 'Canada',
    continent: 'America',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[17].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 1250,
    rating: 4.91,
    amenities: ['Waterfront Promenade', 'Hydrotherapy Pool', 'Seafood Grill']
  },
  {
    id: 'prop-lake-como',
    slug: 'hanford-hotel-resort-lake-como',
    name: 'Hanford Hotel & Resort Lake Como',
    tagline: 'An Escape into Italian Lakeside Luxury',
    address: 'Via Regina 40, 22012 Cernobbio, Lake Como, Italy',
    country: 'Italy',
    continent: 'Europe',
    status: 'Coming Soon',
    detailsHtml: MOCK_RAW_GOOGLE_SHEETS_DATA[18].Details,
    driveFolderUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1800&q=85',
    galleryImages: [],
    priceFrom: 2200,
    rating: 4.98,
    amenities: ['Floating Lake Pool', 'Private Boat Launch', 'Historic Villa Gardens']
  }
];

export const MOCK_PROPERTIES: Property[] = RAW_PROPERTIES_DATA.map((p) => {
  const isEcoResort = p.name.toLowerCase().includes('eco resort') || p.tagline.toLowerCase().includes('eco resort');
  const priceStandard = p.priceFrom || 850;
  const priceDeluxe = Math.round(priceStandard * 1.45);
  const pricePresidential = Math.round(priceStandard * 3.8);
  const pricePrivateVilla = isEcoResort ? Math.round(priceStandard * 5.2) : undefined;
  const priceMeetingRoom = 120;
  const priceEventHall = 3200;
  const priceCateringPerPax = 75;

  return {
    ...p,
    priceStandard,
    priceDeluxe,
    pricePresidential,
    pricePrivateVilla,
    priceMeetingRoom,
    priceEventHall,
    priceCateringPerPax,
    isEcoResort,
    capacityStandard: 'Max 3 guests (2 Adults + 1 Child)',
    capacityDeluxe: 'Max 3 guests (2 Adults + 1 Child)',
    capacityPresidential: 'Max 5 guests (4 Adults + 1 Child)',
    capacityPrivateVilla: isEcoResort ? 'Max 6 guests (4 Adults + 2 Children)' : undefined
  };
});
