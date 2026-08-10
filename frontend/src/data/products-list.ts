export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating?: number;
  reviews?: number;
  weights?: string[];
  category: string;
  badge?: string;
  features?: string[];
  image?: string;
}

export const PRODUCTS: Product[] = [
  // MALT (6)
  { id: 'm-1', category: 'Malt', name: 'BANANA BABY MALT', description: 'Traditionally prepared nutritional energy mix for infants and kids.', price: 250, badge: 'BEST SELLER' },
  { id: 'm-2', category: 'Malt', name: 'SWEET POTATO MALT', description: 'Rich in fiber and vitamins, naturally sweet energy booster.', price: 280, badge: 'BEST SELLER' },
  { id: 'm-3', category: 'Malt', name: 'RAGI MALT', description: 'Traditional calcium-rich drink prepared from premium red millet.', price: 210 },
  { id: 'm-4', category: 'Malt', name: 'SPROUTED RAGI MALT', description: 'Enhanced nutrition and easy digestibility from sprouted grains.', price: 230 },
  { id: 'm-5', category: 'Malt', name: 'SPROUTED MULTIGRAIN MALT', description: 'Wholesome blend of sprouted millets and nuts for daily health.', price: 290 },
  { id: 'm-6', category: 'Malt', name: 'PEARL MILLET MALT', description: 'Iron-rich, refreshing traditional drink to beat the summer heat.', price: 220 },

  // NUTRITION HEALTH MIX (4)
  { id: 'hm-1', category: 'Natural Health Mix', name: 'KIDS JUNIOR HEALTH MIX', description: 'Perfect balance of nutrients for growing children.', price: 320, badge: 'BEST SELLER' },
  { id: 'hm-2', category: 'Natural Health Mix', name: 'MULTI MILLET HEALTH MIX', description: 'Premium blend of 10+ millets and traditional cereals.', price: 350, badge: 'BEST SELLER' },
  { id: 'hm-3', category: 'Natural Health Mix', name: 'PROTEIN HEALTH MIX', description: 'High-protein grain mix to aid muscle strength and active lifestyle.', price: 380 },
  { id: 'hm-4', category: 'Natural Health Mix', name: 'DIABETIC HEALTH MIX', description: 'Low glycemic index cereal mix for healthy sugar management.', price: 340 },

  // MILLETS (6)
  { id: 'ml-1', category: 'Millets', name: 'FINGER MILLET', description: 'Calcium-rich whole grain, perfect for traditional porridge.', price: 90 },
  { id: 'ml-2', category: 'Millets', name: 'PEARL MILLET', description: 'High fiber whole millet grain loaded with essential minerals.', price: 80 },
  { id: 'ml-3', category: 'Millets', name: 'FOXTAIL MILLET', description: 'Traditional gluten-free grain rich in protein and iron.', price: 95 },
  { id: 'ml-4', category: 'Millets', name: 'LITTLE MILLET', description: 'Tiny nutrient powerhouses suitable for traditional rice recipes.', price: 85 },
  { id: 'ml-5', category: 'Millets', name: 'BARNYARD MILLET', description: 'Low-calorie ancient grain, excellent alternative to white rice.', price: 90 },
  { id: 'ml-6', category: 'Millets', name: 'KODO MILLET', description: 'Rich in antioxidants and fiber, keeps you full for longer.', price: 85 },

  // MILLET FLOUR (6)
  { id: 'fl-1', category: 'Millet Flours', name: 'FINGER MILLET FLOUR', description: 'Finely ground stone-milled ragi flour for soft rotis.', price: 95 },
  { id: 'fl-2', category: 'Millet Flours', name: 'PEARL MILLET FLOUR', description: 'Nutritious pearl millet flour for authentic traditional flatbreads.', price: 90 },
  { id: 'fl-3', category: 'Millet Flours', name: 'FOXTAIL MILLET FLOUR', description: 'Light and premium flour for backing and health porridges.', price: 100 },
  { id: 'fl-4', category: 'Millet Flours', name: 'LITTLE MILLET FLOUR', description: 'Pure ground little millet flour for diverse healthy cooking.', price: 95 },
  { id: 'fl-5', category: 'Millet Flours', name: 'BARNYARD MILLET FLOUR', description: 'High fiber barnyard millet flour suitable for healthy snacks.', price: 100 },
  { id: 'fl-6', category: 'Millet Flours', name: 'KODO MILLET FLOUR', description: 'Excellent dietary fiber source for traditional kitchen recipes.', price: 95 },

  // MILLET TIFFIN MIX (4)
  { id: 'tm-1', category: 'Millet Tiffin mix', name: 'MULTI MILLET DOSA MIX', description: 'Instant, healthy, and crispy millet dosa batter mix.', price: 120 },
  { id: 'tm-2', category: 'Millet Tiffin mix', name: 'MULTI MILLET IDLY MIX', description: 'Soft and nutritious steaming millet idly prepared instantly.', price: 115 },
  { id: 'tm-3', category: 'Millet Tiffin mix', name: 'MULTI MILLET PONGAL MIX', description: 'Comfort food made healthy with premium millets and lentils.', price: 130 },
  { id: 'tm-4', category: 'Millet Tiffin mix', name: 'MULTI MILLET UPMA MIX', description: 'Coarse millet rava mix with traditional spices for breakfast.', price: 110 },

  // MILLET NOODLES (5)
  { id: 'nd-1', category: 'Millet Noodles', name: 'INSTANT MAGIC MASALA NOODLES', description: 'Delicious instant noodles with traditional Indian spice seasoning.', price: 85 },
  { id: 'nd-2', category: 'Millet Noodles', name: 'INSTANT CLASSIC MASALA NOODLES', description: 'Perfect classic flavor seasoning paired with healthy millet noodles.', price: 80 },
  { id: 'nd-3', category: 'Millet Noodles', name: 'INSTANT SCHEZWAN MASALA NOODLES', description: 'Spicy Schezwan kick blended with wholesome multi-millet base.', price: 90 },
  { id: 'nd-4', category: 'Millet Noodles', name: 'INSTANT MILD MASALA NOODLES', description: 'Soft and gentle spice blend, perfect for toddlers and kids.', price: 80 },
  { id: 'nd-5', category: 'Millet Noodles', name: 'HAKKA MULTIMILLET NOODLES', description: 'Pure Hakka style multi-millet noodles without tastemakers.', price: 95 },

  // RICE (6)
  { id: 'rc-1', category: 'Rice', name: 'BLACK KAVUNI RICE', description: 'Traditional royal black rice rich in anthocyanin antioxidants.', price: 190 },
  { id: 'rc-2', category: 'Rice', name: 'MAPPILLAI SAMBA RICE', description: 'Bridegroom rice, traditional variety known for strength and stamina.', price: 140 },
  { id: 'rc-3', category: 'Rice', name: 'RED RICE', description: 'Unpolished traditional red rice variety with high nutrient profile.', price: 120 },
  { id: 'rc-4', category: 'Rice', name: 'THOOYAMALLI RICE', description: 'Pure white jasmine rice variety, soft texture and highly aromatic.', price: 135 },
  { id: 'rc-5', category: 'Rice', name: 'KATTUYANAM RICE', description: 'Wild forest rice variety known for bone strength and immunity.', price: 150 },
  { id: 'rc-6', category: 'Rice', name: 'SEERAGA SAMBA RICE', description: 'Short grain aromatic rice, perfect for traditional village biryani.', price: 160 },

  // NATURAL SUGAR (5)
  { id: 'sg-1', category: 'Natural Sugar', name: 'DATES POWDER', description: '100% natural sweetener made from dehydrated premium dates.', price: 290 },
  { id: 'sg-2', category: 'Natural Sugar', name: 'JAGGERY POWDER', description: 'Traditional unrefined cane sugar powder, chemical free.', price: 110 },
  { id: 'sg-3', category: 'Natural Sugar', name: 'CANE JAGGERY', description: 'Solid blocks of traditional country jaggery, rich in iron.', price: 120 },
  { id: 'sg-4', category: 'Natural Sugar', name: 'PALM JAGGERY', description: 'Pure karupatti made from palm tree sap, high mineral value.', price: 260 },
  { id: 'sg-5', category: 'Natural Sugar', name: 'PALM CANDY', description: 'Panakarkandu, natural cooling sweetener for throat health.', price: 280 },

  // MILLET COOKIES (6)
  { id: 'ck-1', category: 'Millet Cookies', name: 'MULTI MILLET CHOCO COOKIES', description: 'Guilt-free baked cookies with rich cocoa and multi millets.', price: 140 },
  { id: 'ck-2', category: 'Millet Cookies', name: 'RAGI COOKIES', description: 'Crispy cookies baked with pure ragi flour and country sugar.', price: 120 },
  { id: 'ck-3', category: 'Millet Cookies', name: 'FOXTAIL MILLET COOKIES', description: 'High fiber, light, and delicious healthy tea-time snack.', price: 130 },
  { id: 'ck-4', category: 'Millet Cookies', name: 'LITTLE MILLET COOKIES', description: 'Healthy baked cookies made of nutritious little millets.', price: 130 },
  { id: 'ck-5', category: 'Millet Cookies', name: 'KODO MILLET COOKIES', description: 'Baked to perfection using premium kodo millet grains.', price: 130 },
  { id: 'ck-6', category: 'Millet Cookies', name: 'BARNYARD MILLET COOKIES', description: 'Gluten-free cookies loaded with natural sweetness and fiber.', price: 130 },

  // SNACKS (7)
  { id: 'sk-1', category: 'Snacks', name: 'BANANA CHIPS', description: 'Crispy wood-fired banana chips prepared in pure coconut oil.', price: 110 },
  { id: 'sk-2', category: 'Snacks', name: 'MILLET CHIKKI', description: 'Traditional peanut chikki with healthy multi-millet grains.', price: 75 },
  { id: 'sk-3', category: 'Snacks', name: 'PEANUT CANDY', description: 'Kadalai mittai, traditional crunchy sweet peanut blocks.', price: 60 },
  { id: 'sk-4', category: 'Snacks', name: 'PEANUT CHOCO BALL', description: 'Delicious fusion of roasted peanuts and sweet cocoa coating.', price: 90 },
  { id: 'sk-5', category: 'Snacks', name: 'ALMOND HEARTS', description: 'Premium heart-shaped snacks made with pure almonds and honey.', price: 180 },
  { id: 'sk-6', category: 'Snacks', name: 'MAKANA ONION BALL', description: 'Spiced and roasted lotus seeds flavored with rich onion spices.', price: 120 },
  { id: 'sk-7', category: 'Snacks', name: 'MULTIGRAIN BALL', description: 'Healthy roasted balls packed with traditional grains and nuts.', price: 100 },
];
