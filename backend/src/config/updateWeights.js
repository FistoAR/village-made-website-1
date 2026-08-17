import { query } from './db.js';

async function updateExistingProductsWeights() {
  console.log('🔄 Updating existing products weights in the database...');
  try {
    const result = await query(`
      UPDATE products
      SET weights = jsonb_build_array(
        jsonb_build_object('weight', '250 g', 'price', round(price * 0.6)),
        jsonb_build_object('weight', '500 g', 'price', price),
        jsonb_build_object('weight', '1 kg', 'price', round(price * 1.8))
      )
      WHERE weights IS NULL OR jsonb_typeof(weights) != 'array' OR (
        jsonb_array_length(weights) > 0 AND jsonb_typeof(weights->0) = 'string'
      );
    `);
    console.log(`✅ Update complete. Rows updated: ${result.rowCount}`);
  } catch (err) {
    console.error('❌ Error updating product weights:', err);
  } finally {
    process.exit(0);
  }
}

updateExistingProductsWeights();
