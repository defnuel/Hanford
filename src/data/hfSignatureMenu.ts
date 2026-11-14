export type SignatureMenuCategory = 'breakfast' | 'lunch_dinner' | 'beverages';

export interface SignatureEnhancementOption {
  id: string;
  label: string;
  price: number;
}

export interface SignatureMenuItem {
  id: string;
  category: SignatureMenuCategory;
  section: string;
  name: string;
  description?: string;
  price: number;
  variantLabel?: string;
  variants?: string[];
  secondaryVariantLabel?: string;
  secondaryVariants?: string[];
  enhancements?: SignatureEnhancementOption[];
}

export const SIGNATURE_CATEGORY_TABS: {
  id: SignatureMenuCategory;
  label: string;
  hours?: string;
}[] = [
  { id: 'breakfast', label: 'Breakfast', hours: '10:30 am – 1:00 pm' },
  { id: 'lunch_dinner', label: 'Lunch and Dinner' },
  { id: 'beverages', label: 'Beverages' }
];

export const HF_SIGNATURE_MENU: SignatureMenuItem[] = [
  // =========================================================================
  // BREAKFAST — SET BREAKFAST
  // =========================================================================
  {
    id: 'bk-healthy',
    category: 'breakfast',
    section: 'Set Breakfast',
    name: 'Healthy',
    description:
      'Oat bars and ginger shot, Greek yogurt with red berries, banana, oats and honey, organic avocado toast with nuts, choice of Detox, Orange, or Grapefruit juice, and coffee or tea.',
    price: 44,
    variantLabel: 'Juice',
    variants: ['Detox Juice', 'Orange Juice', 'Grapefruit Juice'],
    secondaryVariantLabel: 'Hot Beverage',
    secondaryVariants: ['Coffee', 'Tea']
  },
  {
    id: 'bk-continental',
    category: 'breakfast',
    section: 'Set Breakfast',
    name: 'Continental',
    description:
      'Pastry selection and bread basket, seasonal fruit bowl, cheese selection, charcuterie selection, choice of Detox, Orange, or Grapefruit juice, and coffee or tea.',
    price: 46,
    variantLabel: 'Juice',
    variants: ['Detox Juice', 'Orange Juice', 'Grapefruit Juice'],
    secondaryVariantLabel: 'Hot Beverage',
    secondaryVariants: ['Coffee', 'Tea']
  },
  {
    id: 'bk-classic-platter',
    category: 'breakfast',
    section: 'Set Breakfast',
    name: 'Classic Platter',
    description:
      'Red berries bowl, bread basket, toasted bread with grated tomato, dry-cured artisan ham, classic farm egg omelette, choice of Detox, Orange, or Grapefruit juice, and coffee or tea.',
    price: 49,
    variantLabel: 'Juice',
    variants: ['Detox Juice', 'Orange Juice', 'Grapefruit Juice'],
    secondaryVariantLabel: 'Hot Beverage',
    secondaryVariants: ['Coffee', 'Tea']
  },

  // =========================================================================
  // BREAKFAST — À LA CARTE
  // =========================================================================
  {
    id: 'bk-greek-yogurt',
    category: 'breakfast',
    section: 'À la Carte',
    name: 'Greek Yogurt Bowl',
    description: 'Organic granola, seasonal fruit, organic honey.',
    price: 16
  },
  {
    id: 'bk-bread-basket',
    category: 'breakfast',
    section: 'À la Carte',
    name: 'Bread Basket',
    description: 'White, wholemeal, and brioche bread served with butter and jam.',
    price: 17
  },
  {
    id: 'bk-bakery-basket',
    category: 'breakfast',
    section: 'À la Carte',
    name: 'Bakery Basket (3 pcs.)',
    description: 'Danish pastry, pain au chocolat, butter croissant.',
    price: 18
  },
  {
    id: 'bk-organic-avocado-toast',
    category: 'breakfast',
    section: 'À la Carte',
    name: 'Organic Avocado Toast',
    description: 'Avocado on toasted artisan bread with nuts and citrus.',
    price: 21
  },
  {
    id: 'bk-fresh-fruit-bowl',
    category: 'breakfast',
    section: 'À la Carte',
    name: 'Fresh Fruit Bowl',
    description: 'Selection of seasonal fresh fruits.',
    price: 22
  },
  {
    id: 'bk-cured-ham-toast',
    category: 'breakfast',
    section: 'À la Carte',
    name: 'Cured Ham Toast',
    description: 'Dry-cured artisan ham, grated tomato, extra virgin olive oil.',
    price: 26
  },
  {
    id: 'bk-avocado-benedict',
    category: 'breakfast',
    section: 'À la Carte',
    name: 'Avocado Benedict',
    description: 'Croissant bread, bacon, avocado, poached egg, hollandaise sauce.',
    price: 26,
    enhancements: [{ id: 'caviar-5g', label: 'Caviar (5g)', price: 33 }]
  },
  {
    id: 'bk-royal-benedict',
    category: 'breakfast',
    section: 'À la Carte',
    name: 'Royal Benedict',
    description: 'Croissant bread, smoked salmon, poached eggs, hollandaise sauce.',
    price: 31,
    enhancements: [{ id: 'caviar-5g', label: 'Caviar (5g)', price: 33 }]
  },
  {
    id: 'bk-royal-omelette',
    category: 'breakfast',
    section: 'À la Carte',
    name: 'Royal Omelette',
    description: 'Eggs, potatoes, "King Classic" caviar (15g).',
    price: 48
  },

  // =========================================================================
  // BREAKFAST — ENHANCEMENTS
  // =========================================================================
  {
    id: 'bk-add-egg',
    category: 'breakfast',
    section: 'Enhancements',
    name: 'Egg Your Way',
    price: 6
  },
  {
    id: 'bk-add-salmon',
    category: 'breakfast',
    section: 'Enhancements',
    name: 'Smoked Salmon',
    price: 8
  },
  {
    id: 'bk-add-bacon',
    category: 'breakfast',
    section: 'Enhancements',
    name: 'Bacon',
    price: 8
  },
  {
    id: 'bk-add-avocado',
    category: 'breakfast',
    section: 'Enhancements',
    name: 'Avocado',
    price: 9
  },
  {
    id: 'bk-add-cured-ham',
    category: 'breakfast',
    section: 'Enhancements',
    name: 'Cured Ham',
    price: 9
  },
  {
    id: 'bk-add-caviar',
    category: 'breakfast',
    section: 'Enhancements',
    name: 'Caviar (5g)',
    price: 33
  },

  // =========================================================================
  // LUNCH AND DINNER — TASTING STAND
  // =========================================================================
  {
    id: 'ld-tasting-stand',
    category: 'lunch_dinner',
    section: 'Tasting Experience',
    name: 'Signature Tasting Stand (Per Person)',
    description:
      'Cold Stand: bread basket, fresh oyster, crispy wheat pocket, olive & anchovy skewer, foie gras pâté with pickles, mustard and crisp flatbread, artichoke & cured ham salad. Hot Stand: grilled Wagyu beef sandwich, crispy layered potatoes with spiced tomato sauce, crispy prawn taco. Dessert: homemade cake with coffee or tea.',
    price: 60,
    enhancements: [
      { id: 'pair-sparkling', label: 'Sparkling Brut Pairing', price: 10 },
      { id: 'pair-champagne', label: 'Ruinart Brut Champagne Pairing', price: 19 },
      { id: 'pair-rose', label: 'Ruinart Brut Rosé Champagne Pairing', price: 23 }
    ]
  },

  // =========================================================================
  // LUNCH AND DINNER — ALL-DAY PLATES & SHARING
  // =========================================================================
  {
    id: 'ld-crispy-potatoes',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Crispy Layered Potatoes',
    description: 'Mille-feuille potatoes, spiced tomato sauce, vegan aioli.',
    price: 15
  },
  {
    id: 'ld-falafel-wrap',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Falafel Wrap',
    description: 'Tzatziki, sriracha, tomato, onion, lettuce, pickles, french fries.',
    price: 19,
    enhancements: [{ id: 'extra-falafel', label: 'Extra Falafel', price: 6 }]
  },
  {
    id: 'ld-ham-croquettes',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Cured Ham Croquettes (4 pcs.)',
    description: 'Crisp artisan croquettes with creamy béchamel.',
    price: 19
  },
  {
    id: 'ld-wagyu-sandwich',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Grilled Wagyu Sandwich',
    description: 'Wagyu cured beef, melted mozzarella, truffle, french fries.',
    price: 22
  },
  {
    id: 'ld-cheese-selection',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Artisan Cheese Selection',
    description: 'Curated platter of aged gourmet cheeses.',
    price: 23
  },
  {
    id: 'ld-poke-bowl',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Poke Bowl',
    description:
      'Rice, lettuce, avocado, edamame, seasonal vegetables, pineapple, cashews, ponzu sauce, spicy mayonnaise.',
    price: 24,
    enhancements: [
      { id: 'extra-salmon', label: 'Extra Smoked Salmon', price: 8 },
      { id: 'extra-tuna', label: 'Extra Tuna', price: 12 }
    ]
  },
  {
    id: 'ld-caesar-salad',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Caesar Salad',
    description: 'Crispy chicken, mixed greens, anchovies, Grana Padano cheese, croutons.',
    price: 26,
    enhancements: [{ id: 'extra-prawns', label: 'Extra Prawns', price: 8 }]
  },
  {
    id: 'ld-tuna-tartare',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Tuna Tartare',
    description: 'Tuna tartare, citrus pearls, roasted avocado, tomatoes, yuzu & honey dressing, crisp flatbread.',
    price: 30
  },
  {
    id: 'ld-club-sandwich',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Club Sandwich',
    description: 'Free-range chicken, bacon, egg, Comté cheese, tomato, avocado, mustard dressing, french fries.',
    price: 32
  },
  {
    id: 'ld-tenderloin-club',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Tenderloin Club Sandwich',
    description: 'Beef tenderloin, lettuce, fried egg, Comté cheese, honey-mustard dressing, truffled crushed potatoes.',
    price: 36
  },
  {
    id: 'ld-signature-burger',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Signature Beef Burger',
    description:
      'Matured beef loin patty, bacon, cheese, tomato, relish, lettuce, barbecue sauce, truffled crushed potatoes.',
    price: 38
  },
  {
    id: 'ld-acorn-cured-ham',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Acorn-Fed Dry-Cured Ham',
    description: '100% acorn-fed dry-cured ham.',
    price: 46
  },
  {
    id: 'ld-royal-omelette',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Signature Royal Omelette',
    description: 'Eggs, potatoes, sour cream, Schrenckii caviar (15g).',
    price: 48
  },
  {
    id: 'ld-lobster-roll',
    category: 'lunch_dinner',
    section: 'Mains, Salads & Sharing',
    name: 'Lobster Roll',
    description: 'Brioche, lobster, pickles, red cabbage, hollandaise sauce, Schrenckii caviar (5g), french fries.',
    price: 55
  },

  // =========================================================================
  // LUNCH AND DINNER — CAVIAR SERVICE
  // =========================================================================
  {
    id: 'ld-caviar-martini',
    category: 'lunch_dinner',
    section: 'Caviar Service',
    name: 'Caviar & Martini',
    description: 'Schrenckii caviar (30g) served with Belvedere 10 Vodka Martini.',
    price: 82
  },
  {
    id: 'ld-caviar-oscietra-50',
    category: 'lunch_dinner',
    section: 'Caviar Service',
    name: 'Oscietra Caviar (50g)',
    description: 'Served with traditional accompaniments.',
    price: 250
  },
  {
    id: 'ld-caviar-oscietra-100',
    category: 'lunch_dinner',
    section: 'Caviar Service',
    name: 'Oscietra Caviar (100g)',
    description: 'Served with traditional accompaniments.',
    price: 490
  },
  {
    id: 'ld-caviar-kristal',
    category: 'lunch_dinner',
    section: 'Caviar Service',
    name: 'Kristal Caviar (100g)',
    description: 'Served with traditional accompaniments.',
    price: 625
  },
  {
    id: 'ld-caviar-imperial-50',
    category: 'lunch_dinner',
    section: 'Caviar Service',
    name: 'Imperial Caviar (50g)',
    description: 'Served with traditional accompaniments.',
    price: 790
  },

  // =========================================================================
  // LUNCH AND DINNER — SWEET CORNER
  // =========================================================================
  {
    id: 'ld-cookies',
    category: 'lunch_dinner',
    section: 'Sweet Corner',
    name: 'Artisan Cookies',
    description: 'Baked fresh daily.',
    price: 6,
    variantLabel: 'Flavor',
    variants: ['Chocolate', 'Hazelnut']
  },
  {
    id: 'ld-ice-cream',
    category: 'lunch_dinner',
    section: 'Sweet Corner',
    name: 'Ice Cream',
    description: 'Artisanal ice cream.',
    price: 12,
    variantLabel: 'Flavor',
    variants: ['Chocolate', 'Strawberry', 'Pistachio', 'Vanilla']
  },
  {
    id: 'ld-cake-of-the-day',
    category: 'lunch_dinner',
    section: 'Sweet Corner',
    name: 'Cake of the Day',
    description: 'Daily patisserie selection.',
    price: 14
  },
  {
    id: 'ld-tiramisu',
    category: 'lunch_dinner',
    section: 'Sweet Corner',
    name: 'Tiramisù',
    description: 'Chocolate cake with Amaretto, Gianduja, coffee praline, and white chocolate.',
    price: 20
  },
  {
    id: 'ld-pistachio-pastry',
    category: 'lunch_dinner',
    section: 'Sweet Corner',
    name: 'Pistachio Pastry',
    description: 'Pistachio praline and raspberry compote.',
    price: 20
  },
  {
    id: 'ld-cheesecake',
    category: 'lunch_dinner',
    section: 'Sweet Corner',
    name: 'Signature Cheesecake',
    description: 'Creamy baked cheesecake with a crisp biscuit crust.',
    price: 22,
    variantLabel: 'Style',
    variants: ['Original', 'Pistachio', 'Lemon', 'Caramel']
  },
  {
    id: 'ld-citrus-diamond',
    category: 'lunch_dinner',
    section: 'Sweet Corner',
    name: 'Citrus Diamond',
    description: 'Lemon, calamansi-yuzu filling, and almond sponge.',
    price: 22
  },
  {
    id: 'ld-gold-bar',
    category: 'lunch_dinner',
    section: 'Sweet Corner',
    name: 'Signature Gold Bar',
    description: 'Vanilla and hazelnut praline with 70% dark chocolate.',
    price: 22
  },

  // =========================================================================
  // BEVERAGES — SIGNATURE COCKTAILS
  // =========================================================================
  {
    id: 'bv-hidden-gem',
    category: 'beverages',
    section: 'Signature Cocktails',
    name: 'Hidden Gem',
    description: 'Aged Amontillado sherry, dark grape tea distillate, orange bitters.',
    price: 19
  },
  {
    id: 'bv-the-reserve',
    category: 'beverages',
    section: 'Signature Cocktails',
    name: 'The Reserve',
    description: 'Crisp dry sherry, lemon balm distillate, jasmine cold brew, soda.',
    price: 19
  },
  {
    id: 'bv-bankers-reserve',
    category: 'beverages',
    section: 'Signature Cocktails',
    name: "The Banker's Reserve",
    description: 'Glenmorangie 12 whisky, Hennessy VS, craft vermouth, Amontillado, Bénédictine.',
    price: 20
  },
  {
    id: 'bv-prime-rate',
    category: 'beverages',
    section: 'Signature Cocktails',
    name: 'Prime Rate',
    description: 'Casamigos Mezcal, craft vermouth, orange-cinnamon syrup.',
    price: 22
  },
  {
    id: 'bv-capital-spritz',
    category: 'beverages',
    section: 'Signature Cocktails',
    name: 'Capital Spritz',
    description: 'Volcán Tequila, chipotle smoke liqueur, pink grapefruit liqueur, grapefruit cordial, soda.',
    price: 22
  },
  {
    id: 'bv-golden-espresso-martini',
    category: 'beverages',
    section: 'Signature Cocktails',
    name: 'Golden Espresso Martini',
    description: 'Belvedere vodka, coffee & cinnamon infusion, white cacao liqueur, vanilla syrup.',
    price: 22
  },
  {
    id: 'bv-final-balance',
    category: 'beverages',
    section: 'Signature Cocktails',
    name: 'Final Balance',
    description: 'Macallan 12 whisky, plum distillate, walnut bitters, honey syrup.',
    price: 24
  },
  {
    id: 'bv-grand-heist',
    category: 'beverages',
    section: 'Signature Cocktails',
    name: 'The Grand Heist',
    description: 'Hibiki Harmony whisky, craft vermouth, clarified plum water, demerara syrup, mole bitters.',
    price: 24
  },

  // =========================================================================
  // BEVERAGES — NON-ALCOHOLIC CREATIONS
  // =========================================================================
  {
    id: 'bv-the-ledger',
    category: 'beverages',
    section: 'Non-Alcoholic Creations',
    name: 'The Ledger',
    description: 'Seedlip Grove, green tea, rosemary-thyme botanical distillate.',
    price: 18
  },
  {
    id: 'bv-capital-flow',
    category: 'beverages',
    section: 'Non-Alcoholic Creations',
    name: 'Capital Flow',
    description: 'Tanqueray 0.0%, bitter aperitif, dandelion root-fennel distillate.',
    price: 18
  },
  {
    id: 'bv-botanical-brew',
    category: 'beverages',
    section: 'Non-Alcoholic Creations',
    name: 'Botanical Brew',
    description: 'Cold brew chamomile, cardamom distillate, spiced honey syrup.',
    price: 18
  },

  // =========================================================================
  // BEVERAGES — SOFT DRINKS & BOTANICAL MIXERS
  // =========================================================================
  {
    id: 'bv-le-tonic',
    category: 'beverages',
    section: 'Soft Drinks & Mixers',
    name: 'London Essence Original Indian Tonic',
    price: 8
  },
  {
    id: 'bv-le-soda',
    category: 'beverages',
    section: 'Soft Drinks & Mixers',
    name: 'London Essence Soda',
    price: 8,
    variantLabel: 'Selection',
    variants: ['Peach & Jasmine', 'Club Soda']
  },
  {
    id: 'bv-le-ginger',
    category: 'beverages',
    section: 'Soft Drinks & Mixers',
    name: 'London Essence Ginger',
    price: 8,
    variantLabel: 'Selection',
    variants: ['Ginger Beer', 'Ginger Ale']
  },
  {
    id: 'bv-soft-drinks',
    category: 'beverages',
    section: 'Soft Drinks & Mixers',
    name: 'Soft Drinks',
    price: 8,
    variantLabel: 'Selection',
    variants: ['Coca-Cola', 'Coca-Cola Zero', 'Coca-Cola Light', 'Fanta Lemon', 'Fanta Orange', 'Sprite']
  },

  // =========================================================================
  // BEVERAGES — COFFEE, TEA & FRESH JUICES
  // =========================================================================
  {
    id: 'bv-ginger-shot',
    category: 'beverages',
    section: 'Coffee, Tea & Fresh Juices',
    name: 'Ginger Shot',
    price: 6
  },
  {
    id: 'bv-espresso',
    category: 'beverages',
    section: 'Coffee, Tea & Fresh Juices',
    name: 'Espresso',
    description: 'Sustainably sourced coffee.',
    price: 10
  },
  {
    id: 'bv-cortado',
    category: 'beverages',
    section: 'Coffee, Tea & Fresh Juices',
    name: 'Cortado',
    description: 'Sustainably sourced coffee.',
    price: 10
  },
  {
    id: 'bv-americano',
    category: 'beverages',
    section: 'Coffee, Tea & Fresh Juices',
    name: 'Americano',
    description: 'Sustainably sourced coffee.',
    price: 11
  },
  {
    id: 'bv-double-espresso',
    category: 'beverages',
    section: 'Coffee, Tea & Fresh Juices',
    name: 'Double Espresso',
    description: 'Sustainably sourced coffee.',
    price: 11
  },
  {
    id: 'bv-latte',
    category: 'beverages',
    section: 'Coffee, Tea & Fresh Juices',
    name: 'Latte',
    description: 'Sustainably sourced coffee.',
    price: 12
  },
  {
    id: 'bv-cappuccino',
    category: 'beverages',
    section: 'Coffee, Tea & Fresh Juices',
    name: 'Cappuccino',
    description: 'Sustainably sourced coffee.',
    price: 12
  },
  {
    id: 'bv-jing-teas',
    category: 'beverages',
    section: 'Coffee, Tea & Fresh Juices',
    name: 'Fine Leaf Teas',
    description: 'Whole-leaf tea selection.',
    price: 12,
    variantLabel: 'Variety',
    variants: ['Black Tea', 'Green Tea', 'White Tea', 'Red Tea', 'Herbal Infusion']
  },
  {
    id: 'bv-fresh-juices',
    category: 'beverages',
    section: 'Coffee, Tea & Fresh Juices',
    name: 'Fresh Juices',
    price: 12,
    variantLabel: 'Selection',
    variants: ['Orange Juice', 'Grapefruit Juice', 'Detox Juice']
  },
  {
    id: 'bv-fresh-infusions',
    category: 'beverages',
    section: 'Coffee, Tea & Fresh Juices',
    name: 'Fresh Botanical Infusions',
    price: 14,
    variantLabel: 'Selection',
    variants: ['Ginger', 'Lemon', 'Mint']
  },
  {
    id: 'bv-matcha',
    category: 'beverages',
    section: 'Coffee, Tea & Fresh Juices',
    name: 'Matcha Tea Selection',
    price: 15,
    variantLabel: 'Variety',
    variants: ['Umami', 'Cream', 'Herb']
  },
  {
    id: 'bv-hot-chocolate',
    category: 'beverages',
    section: 'Coffee, Tea & Fresh Juices',
    name: 'Artisanal Hot Chocolate',
    price: 16
  },

  // =========================================================================
  // BEVERAGES — CHAMPAGNE & SPARKLING
  // =========================================================================
  {
    id: 'bv-sparkling-brut',
    category: 'beverages',
    section: 'Champagne & Sparkling',
    name: 'Sparkling Brut Reserve (Glass)',
    price: 10
  },
  {
    id: 'bv-ruinart-brut',
    category: 'beverages',
    section: 'Champagne & Sparkling',
    name: 'Ruinart Brut Champagne (Glass)',
    price: 19
  },
  {
    id: 'bv-ruinart-rose',
    category: 'beverages',
    section: 'Champagne & Sparkling',
    name: 'Ruinart Brut Rosé Champagne (Glass)',
    price: 23
  }
];
