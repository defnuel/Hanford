export interface MenuItem {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch-dinner' | 'beverages';
  subcategory: string;
  price: number; // in USD
  description: string;
  tags: string[]; // e.g. "Chef's Signature", "Vegetarian", "Gluten-Free", "Zero-Proof", "Alcoholic"
  availableHours: string;
  isPopular?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  specialNotes?: string;
}

export interface DiningOrder {
  orderId: string;
  createdAt: string;
  guestName: string;
  xHandle?: string;
  phone?: string;
  destinationType: 'in-room' | 'lounge-table' | 'poolside';
  roomOrTableNumber: string;
  diningTime: 'immediate' | 'scheduled';
  scheduledTime?: string;
  items: CartItem[];
  subtotal: number;
  serviceCharge: number; // 10%
  tax: number; // 10%
  grandTotal: number;
  specialInstructions?: string;
  paymentMethod: 'room-folio' | 'house-account' | 'pay-on-delivery';
  status: 'CONFIRMED';
}

export const MENU_ITEMS: MenuItem[] = [
  // ==========================================
  // BREAKFAST (07:00 – 11:30)
  // ==========================================
  {
    id: 'bf-set-continental',
    name: 'The Hanford Continental Breakfast',
    category: 'breakfast',
    subcategory: 'Breakfast Sets',
    price: 38,
    description: 'Selection of handcrafted French viennoiseries and artisan sourdough, Normandy churned butter, organic fruit preserves, seasonal sliced fruits, fresh orange juice, and single-origin coffee or tea.',
    tags: ["Chef's Signature", 'Vegetarian'],
    availableHours: '07:00 – 11:30',
    isPopular: true
  },
  {
    id: 'bf-set-deluxe',
    name: 'The Executive English Deluxe Set',
    category: 'breakfast',
    subcategory: 'Breakfast Sets',
    price: 46,
    description: 'Two organic eggs prepared your way (poached, scrambled, or sunny-side), artisanal cured bacon, Cumberland herb sausages, roasted portobello mushroom, grilled vine tomatoes, toasted brioche, fresh juice, and choice of hot beverage.',
    tags: ["Chef's Signature"],
    availableHours: '07:00 – 11:30',
    isPopular: true
  },
  {
    id: 'bf-set-wellness',
    name: 'The Wellness & Vitality Set',
    category: 'breakfast',
    subcategory: 'Breakfast Sets',
    price: 42,
    description: 'Organic açai and Greek yogurt bowl with toasted chia almond granola, crushed Haas avocado on artisan sourdough toast, poached organic egg, cold-pressed green detox elixir, and ceremonial green tea.',
    tags: ['Healthy', 'Vegetarian'],
    availableHours: '07:00 – 11:30'
  },
  {
    id: 'bf-eggs-benedict-royal',
    name: 'Eggs Benedict Royale',
    category: 'breakfast',
    subcategory: 'Eggs & Morning Specialties',
    price: 36,
    description: 'Two poached organic free-range eggs, house-cured Scottish smoked salmon, toasted English muffin, velvety citrus hollandaise, crowned with Royal Ossetra caviar pearls.',
    tags: ["Chef's Signature", 'Caviar'],
    availableHours: '07:00 – 11:30',
    isPopular: true
  },
  {
    id: 'bf-eggs-benedict-classic',
    name: 'Classic Eggs Benedict',
    category: 'breakfast',
    subcategory: 'Eggs & Morning Specialties',
    price: 30,
    description: 'Poached organic eggs, crispy artisanal pancetta, toasted English muffin, silky Meyer lemon hollandaise, served with roasted heirloom baby potatoes.',
    tags: ['Classic'],
    availableHours: '07:00 – 11:30'
  },
  {
    id: 'bf-truffle-omelette',
    name: 'Black Truffle & Gruyère Omelette',
    category: 'breakfast',
    subcategory: 'Eggs & Morning Specialties',
    price: 34,
    description: 'Three organic farm eggs rolled French-style with black winter truffle shavings, melted Swiss Gruyère cheese, fresh chives, served with organic baby greens.',
    tags: ['Vegetarian', 'Gluten-Free'],
    availableHours: '07:00 – 11:30',
    isPopular: true
  },
  {
    id: 'bf-avocado-tartine',
    name: 'Smashed Avocado & Poached Egg Tartine',
    category: 'breakfast',
    subcategory: 'Eggs & Morning Specialties',
    price: 26,
    description: 'Crushed Hass avocado, poached organic egg, watermelon radish ribbons, toasted pumpkin seeds, cold-pressed olive oil, Maldon sea salt on toasted artisan rustic sourdough.',
    tags: ['Vegetarian', 'Healthy'],
    availableHours: '07:00 – 11:30'
  },
  {
    id: 'bf-brioche-french-toast',
    name: 'Madagascar Vanilla Brioche French Toast',
    category: 'breakfast',
    subcategory: 'Bakery & Sweets',
    price: 24,
    description: 'Golden caramelized thick-cut brioche, Madagascar vanilla bean mascarpone whip, wild forest berry compote, pure Canadian maple syrup.',
    tags: ['Sweet', 'Vegetarian'],
    availableHours: '07:00 – 11:30',
    isPopular: true
  },
  {
    id: 'bf-belgian-waffle',
    name: 'Artisan Buttermilk Waffles',
    category: 'breakfast',
    subcategory: 'Bakery & Sweets',
    price: 22,
    description: 'Crisp golden Belgian waffles, Chantilly cream, organic strawberry compote, toasted caramelized pecans, warm amber maple syrup.',
    tags: ['Sweet', 'Vegetarian'],
    availableHours: '07:00 – 11:30'
  },
  {
    id: 'bf-pastry-basket',
    name: 'Artisanal Parisian Viennoiserie Basket',
    category: 'breakfast',
    subcategory: 'Bakery & Sweets',
    price: 22,
    description: 'Flaky pure butter croissant, pain au chocolat, cardamom morning bun, fruit Danish, accompanied by salted Normandy butter and organic apricot jam.',
    tags: ['Bakery', 'Vegetarian'],
    availableHours: '07:00 – 11:30'
  },
  {
    id: 'bf-acai-bowl',
    name: 'Superfood Acai & Greek Yogurt Bowl',
    category: 'breakfast',
    subcategory: 'Bakery & Sweets',
    price: 20,
    description: 'Organic wild Amazon acai blend, strained Greek yogurt, wildflower honey, fresh raspberries, blueberries, banana, house-roasted buckwheat chia granola.',
    tags: ['Healthy', 'Gluten-Free', 'Vegetarian'],
    availableHours: '07:00 – 11:30'
  },

  // ==========================================
  // LUNCH & DINNER (12:00 – 22:30)
  // ==========================================
  {
    id: 'ld-caesar-salad',
    name: 'Hanford Classic Caesar Salad',
    category: 'lunch-dinner',
    subcategory: 'Starters & Salads',
    price: 26,
    description: 'Crisp baby romaine hearts, 24-month aged Parmigiano-Reggiano crisps, herb focaccia croutons, cured white anchovy garlic dressing. (Add grilled organic chicken breast +$8 or grilled tiger prawns +$12).',
    tags: ['Classic'],
    availableHours: '12:00 – 22:30'
  },
  {
    id: 'ld-burrata-salad',
    name: 'Heirloom Burrata di Puglia',
    category: 'lunch-dinner',
    subcategory: 'Starters & Salads',
    price: 28,
    description: 'Creamy artisan burrata pugliese, heirloom cherry tomatoes, cold-pressed Ligurian olive oil, 12-year aged balsamic reduction, micro basil, toasted sourdough wafer.',
    tags: ['Vegetarian', 'Gluten-Free Option'],
    availableHours: '12:00 – 22:30',
    isPopular: true
  },
  {
    id: 'ld-beef-tartare',
    name: 'Hand-Cut Prime Beef Tartare',
    category: 'lunch-dinner',
    subcategory: 'Starters & Salads',
    price: 34,
    description: 'Hand-minced Black Angus beef tenderloin, cured organic egg yolk, caperberries, French cornichons, shallots, Dijon emulsion, grilled brioche crisps.',
    tags: ["Chef's Signature"],
    availableHours: '12:00 – 22:30'
  },
  {
    id: 'ld-mushroom-veloute',
    name: 'Wild Forest Mushroom & Truffle Velouté',
    category: 'lunch-dinner',
    subcategory: 'Starters & Salads',
    price: 22,
    description: 'Slow-simmered seasonal forest mushrooms, black truffle crème, garlic chive oil, served with toasted sourdough bread.',
    tags: ['Vegetarian'],
    availableHours: '12:00 – 22:30'
  },
  {
    id: 'ld-wagyu-burger',
    name: 'The Hanford Prime Wagyu Burger',
    category: 'lunch-dinner',
    subcategory: 'Gourmet Sandwiches & Mains',
    price: 38,
    description: '200g Prime Australian Wagyu beef patty, aged English cheddar, caramelized shallot relish, baby arugula, black truffle aioli on a toasted brioche bun. Served with truffled parmesan fries.',
    tags: ["Chef's Signature", 'Signature Main'],
    availableHours: '12:00 – 22:30',
    isPopular: true
  },
  {
    id: 'ld-tenderloin-ciabatta',
    name: 'Prime Tenderloin Ciabatta Club',
    category: 'lunch-dinner',
    subcategory: 'Gourmet Sandwiches & Mains',
    price: 36,
    description: 'Thinly sliced roasted prime beef tenderloin, melted aged provolone cheese, caramelized sweet onions, horseradish herb crème, wild watercress on stone-baked artisan ciabatta.',
    tags: ['Gourmet Club'],
    availableHours: '12:00 – 22:30'
  },
  {
    id: 'ld-triple-decker-club',
    name: 'The Hanford Triple-Decker Club Sandwich',
    category: 'lunch-dinner',
    subcategory: 'Gourmet Sandwiches & Mains',
    price: 32,
    description: 'Grilled corn-fed chicken breast, crispy artisanal pancetta, free-range hard-boiled egg, heirloom tomato, crisp bibb lettuce, Dijon herb aioli on toasted sourdough. Served with hand-cut fries.',
    tags: ['Classic Club'],
    availableHours: '12:00 – 22:30',
    isPopular: true
  },
  {
    id: 'ld-wagyu-melt',
    name: 'Truffled Wagyu & Buffalo Mozzarella Melt',
    category: 'lunch-dinner',
    subcategory: 'Gourmet Sandwiches & Mains',
    price: 30,
    description: 'Slow-braised Wagyu brisket, melted artisanal buffalo mozzarella, pickled red onion, stone-ground mustard, black truffle butter on griddled sourdough.',
    tags: ['Specialty'],
    availableHours: '12:00 – 22:30'
  },
  {
    id: 'ld-lobster-roll',
    name: 'Artisan Maine Lobster Brioche Roll',
    category: 'lunch-dinner',
    subcategory: 'Gourmet Sandwiches & Mains',
    price: 44,
    description: 'Chilled sweet Maine lobster meat tossed in light lemon chive emulsion, celery crunch, micro herbs, served inside a warm butter-toasted brioche split roll with sea salt kettle chips.',
    tags: ["Chef's Signature", 'Seafood'],
    availableHours: '12:00 – 22:30',
    isPopular: true
  },
  {
    id: 'ld-prawn-linguine',
    name: 'Mediterranean Wild King Prawn Linguine',
    category: 'lunch-dinner',
    subcategory: 'Gourmet Sandwiches & Mains',
    price: 38,
    description: 'Wild king prawns, heirloom cherry tomato confit, white wine garlic reduction, mild chili flakes, cold-pressed olive oil, fresh flat-leaf Italian parsley.',
    tags: ['Seafood', 'Pasta'],
    availableHours: '12:00 – 22:30'
  },
  {
    id: 'ld-short-rib-agnolotti',
    name: 'Braised Beef Short Rib Agnolotti',
    category: 'lunch-dinner',
    subcategory: 'Gourmet Sandwiches & Mains',
    price: 36,
    description: 'Handmade pillow agnolotti filled with 16-hour braised beef short rib, Parmigiano-Reggiano cream sauce, rich pan jus glaze, crispy sage.',
    tags: ['Handcrafted Pasta'],
    availableHours: '12:00 – 22:30'
  },
  {
    id: 'ld-seabass',
    name: 'Pan-Roasted Chilean Seabass',
    category: 'lunch-dinner',
    subcategory: 'Gourmet Sandwiches & Mains',
    price: 48,
    description: 'Wild Chilean seabass fillet, velvety celeriac puree, charred baby broccolini, Meyer lemon beurre blanc, crispy caper berries.',
    tags: ["Chef's Signature", 'Gluten-Free'],
    availableHours: '12:00 – 22:30'
  },
  {
    id: 'ld-golden-ingot',
    name: 'The Hanford Golden Chocolate Ingot',
    category: 'lunch-dinner',
    subcategory: 'Artisan Desserts',
    price: 22,
    description: '70% Valrhona dark chocolate mousse, salted butter caramel core, crunchy hazelnut feuilletine, finished with edible 24-karat gold leaf.',
    tags: ["Chef's Signature", 'Signature Dessert'],
    availableHours: '12:00 – 22:30',
    isPopular: true
  },
  {
    id: 'ld-burnt-cheesecake',
    name: 'Basque Caramelized Burnt Cheesecake',
    category: 'lunch-dinner',
    subcategory: 'Artisan Desserts',
    price: 18,
    description: 'Silky caramelized molten center, Madagascar bourbon vanilla, served with fresh raspberry coulis and wild blueberries.',
    tags: ['Gluten-Free', 'Vegetarian'],
    availableHours: '12:00 – 22:30',
    isPopular: true
  },
  {
    id: 'ld-pistachio-cheesecake',
    name: 'Sicilian Bronte Pistachio Cheesecake',
    category: 'lunch-dinner',
    subcategory: 'Artisan Desserts',
    price: 19,
    description: 'Authentic Sicilian Bronte pistachio shortcrust, velvety mascarpone cream cheese mousse, roasted candied pistachio crumble.',
    tags: ['Vegetarian'],
    availableHours: '12:00 – 22:30'
  },
  {
    id: 'ld-yuzu-tartlet',
    name: 'Citrus Yuzu & Swiss Meringue Tartlet',
    category: 'lunch-dinner',
    subcategory: 'Artisan Desserts',
    price: 18,
    description: 'Crisp sweet sable tart, tangy Japanese yuzu and calamansi curd, crowned with lightly torched Swiss meringue and lime zest.',
    tags: ['Vegetarian'],
    availableHours: '12:00 – 22:30'
  },
  {
    id: 'ld-venetian-tiramisu',
    name: 'Classic Venetian Tiramisù',
    category: 'lunch-dinner',
    subcategory: 'Artisan Desserts',
    price: 17,
    description: 'Savoiardi sponge biscuits steeped in single-origin espresso and Amaretto, layered with airy mascarpone zabaione and Dutch cocoa powder.',
    tags: ['Vegetarian'],
    availableHours: '12:00 – 22:30'
  },

  // ==========================================
  // BEVERAGES (All Day)
  // ==========================================
  {
    id: 'bev-the-hanford-reserve',
    name: 'The Hanford Reserve Smoked Old Fashioned',
    category: 'beverages',
    subcategory: 'Signature Cocktails',
    price: 24,
    description: 'Woodford Reserve Small Batch Bourbon, aromatic Angostura bitters, raw demerara sugar, Luxardo maraschino cherry, infused with aromatic cedarwood smoke under glass cloche.',
    tags: ["Chef's Signature", 'Alcoholic'],
    availableHours: 'All Day',
    isPopular: true
  },
  {
    id: 'bev-citrus-spritz',
    name: 'The Capital Citrus Blossom Spritz',
    category: 'beverages',
    subcategory: 'Signature Cocktails',
    price: 22,
    description: 'Italicus Rosolio di Bergamotto, Valdobbiadene Prosecco Superiore, fresh ruby grapefruit, botanical tonic, fresh garden rosemary sprig.',
    tags: ['Alcoholic', 'Refreshing'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-espresso-martini',
    name: 'Imperial Golden Espresso Martini',
    category: 'beverages',
    subcategory: 'Signature Cocktails',
    price: 22,
    description: 'Ketel One Vodka, freshly extracted single-origin espresso, Kahlúa liqueur, Tahitian vanilla bean essence, topped with three espresso beans and gold dust.',
    tags: ['Alcoholic', 'Cocktail'],
    availableHours: 'All Day',
    isPopular: true
  },
  {
    id: 'bev-royal-bellini',
    name: 'Royal Champagne Peach Bellini',
    category: 'beverages',
    subcategory: 'Signature Cocktails',
    price: 24,
    description: 'Handcrafted Provence white peach nectar, Ruinart Brut Champagne, dash of wild raspberry liqueur.',
    tags: ['Champagne Cocktail', 'Alcoholic'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-plum-jasmine-cooler',
    name: 'Clarified Purple Plum & Jasmine Cooler',
    category: 'beverages',
    subcategory: 'Zero-Proof Mocktails',
    price: 16,
    description: 'Cold-brewed organic jasmine pearls tea, clarified purple plum nectar, lemongrass verbena reduction, fever-tree club soda. Non-alcoholic.',
    tags: ['Zero-Proof', 'Refreshing'],
    availableHours: 'All Day',
    isPopular: true
  },
  {
    id: 'bev-ruby-grapefruit-fizz',
    name: 'Spiced Ruby Grapefruit & Mint Fizz',
    category: 'beverages',
    subcategory: 'Zero-Proof Mocktails',
    price: 15,
    description: 'Freshly pressed ruby grapefruit juice, crushed spearmint, pink peppercorn cordial, sparkling elderflower tonic. Non-alcoholic.',
    tags: ['Zero-Proof'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-cucumber-reviver',
    name: 'Cucumber & Wild Elderflower Reviver',
    category: 'beverages',
    subcategory: 'Zero-Proof Mocktails',
    price: 15,
    description: 'Fresh English cucumber juice, Austrian elderflower cordial, cloudy green apple, fresh Key lime juice, crushed ice. Non-alcoholic.',
    tags: ['Zero-Proof', 'Healthy'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-tea-imperial-breakfast',
    name: 'Imperial English Breakfast Tea (Single Garden)',
    category: 'beverages',
    subcategory: 'Fine Teas & Infusions',
    price: 12,
    description: 'Full-bodied blend of organic single-estate Assam and high-elevation Ceylon black tea leaves, offering rich malty tones and honeyed finish.',
    tags: ['Loose Leaf Tea'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-tea-silver-needle',
    name: 'Rare Silver Needle White Tea (Fujian)',
    category: 'beverages',
    subcategory: 'Fine Teas & Infusions',
    price: 14,
    description: 'Tender first-flush hand-plucked spring tea buds from Fujian province. Silky body with subtle floral sweetness and notes of sweet melon.',
    tags: ['Reserve Tea'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-tea-uji-matcha',
    name: 'Ceremonial Uji Kyoto Matcha',
    category: 'beverages',
    subcategory: 'Fine Teas & Infusions',
    price: 14,
    description: 'Authentic stone-ground Grade-A ceremonial matcha from Uji, Kyoto. Hand-whisked to a frothy jade green texture with vibrant umami notes.',
    tags: ['Matcha', 'Japanese Tea'],
    availableHours: 'All Day',
    isPopular: true
  },
  {
    id: 'bev-tea-french-earl-grey',
    name: 'French Earl Grey & Lavender Petals',
    category: 'beverages',
    subcategory: 'Fine Teas & Infusions',
    price: 12,
    description: 'Premium black tea scented with cold-pressed Italian bergamot, blended with Provence blue lavender flowers and rose petals.',
    tags: ['Loose Leaf Tea'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-coffee-espresso',
    name: 'Single-Estate Double Espresso',
    category: 'beverages',
    subcategory: 'Artisan Coffees',
    price: 9,
    description: 'High-altitude Ethiopian Yirgacheffe washed beans, extracted on our Synesso espresso machine with notes of bergamot, apricot, and milk chocolate.',
    tags: ['Specialty Coffee'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-coffee-flat-white',
    name: 'Velvet Flat White / Cappuccino',
    category: 'beverages',
    subcategory: 'Artisan Coffees',
    price: 10,
    description: 'Double ristretto shot paired with micro-foamed organic whole milk or barista oat milk.',
    tags: ['Coffee'],
    availableHours: 'All Day',
    isPopular: true
  },
  {
    id: 'bev-coffee-iced-latte',
    name: 'Bourbon Vanilla Bean Iced Latte',
    category: 'beverages',
    subcategory: 'Artisan Coffees',
    price: 11,
    description: 'Double shot of cold espresso poured over chilled whole or oat milk with real Tahitian bourbon vanilla bean infusion.',
    tags: ['Iced Coffee'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-hot-chocolate',
    name: 'The Hanford Artisanal Hot Chocolate',
    category: 'beverages',
    subcategory: 'Artisan Coffees',
    price: 12,
    description: 'Melted 70% dark Valrhona Grand Cru chocolate steamed with whole milk, topped with house-made vanilla bean whipped cream and sea salt chocolate flakes.',
    tags: ['Decadent'],
    availableHours: 'All Day',
    isPopular: true
  },
  {
    id: 'bev-juice-orange',
    name: 'Freshly Squeezed Valencia Orange Juice',
    category: 'beverages',
    subcategory: 'Cold-Pressed Juices & Wellness',
    price: 12,
    description: '100% pure cold-pressed Valencia oranges, squeezed moments before serving.',
    tags: ['Fresh Juice', 'Gluten-Free'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-juice-green-detox',
    name: 'Green Detox Alkalizing Elixir',
    category: 'beverages',
    subcategory: 'Cold-Pressed Juices & Wellness',
    price: 14,
    description: 'Cold-pressed Granny Smith apple, English cucumber, celery, curly kale, organic lemon, and fresh ginger root.',
    tags: ['Healthy', 'Juice'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-wine-ruinart',
    name: 'Ruinart Blanc de Blancs Brut NV (Glass)',
    category: 'beverages',
    subcategory: 'Champagnes & Fine Wines',
    price: 38,
    description: '100% Premier Cru Chardonnay from Champagne, France. Notes of fresh citrus, white peach, roasted almond, and elegant brioche.',
    tags: ['Champagne', 'Alcoholic'],
    availableHours: 'All Day',
    isPopular: true
  },
  {
    id: 'bev-wine-moet',
    name: 'Moët & Chandon Impérial Brut NV (Glass)',
    category: 'beverages',
    subcategory: 'Champagnes & Fine Wines',
    price: 32,
    description: 'Classic French Champagne with vibrant green apple, white floral notes, and delicate mineral palate.',
    tags: ['Champagne', 'Alcoholic'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-wine-whispering-angel',
    name: 'Château d’Esclans Whispering Angel Rosé (Glass)',
    category: 'beverages',
    subcategory: 'Champagnes & Fine Wines',
    price: 22,
    description: 'Côtes de Provence, France. Delicate wild strawberry, white nectarine, clean crisp acidity with a dry mineral finish.',
    tags: ['Rosé', 'Alcoholic'],
    availableHours: 'All Day'
  },
  {
    id: 'bev-wine-napa-cabernet',
    name: 'Napa Valley Reserve Cabernet Sauvignon (Glass)',
    category: 'beverages',
    subcategory: 'Champagnes & Fine Wines',
    price: 28,
    description: 'Napa Valley, California. Concentrated dark blackberry, cassis, toasted French oak, sweet tobacco, and velvety tannins.',
    tags: ['Red Wine', 'Alcoholic'],
    availableHours: 'All Day'
  }
];
