import { query } from './db.js';

const run = async () => {
  try {
    console.log('🔄  Clearing existing gallery items in database...');
    await query('DELETE FROM gallery_items');
    
    console.log('🔄  Inserting new dummy YouTube videos...');
    const videos = [
      { title: 'Organic Farming in the Village', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', display_order: 1 },
      { title: 'Making Multi Grain Malt', url: 'https://www.youtube.com/watch?v=9xvca52T_3E', display_order: 2 },
      { title: 'Traditional Stone Milling', url: 'https://www.youtube.com/watch?v=Z1Yd7eM957Q', display_order: 3 },
      { title: 'Hygienic Packaging Process', url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4', display_order: 4 },
      { title: 'Fresh Delivery to Your Home', url: 'https://www.youtube.com/watch?v=EngW7tLk6R8', display_order: 5 }
    ];

    for (const v of videos) {
      await query(
        `INSERT INTO gallery_items (title, url, type, display_order, active)
         VALUES ($1, $2, 'youtube', $3, true)`,
        [v.title, v.url, v.display_order]
      );
    }
    console.log('✅  Database gallery_items table updated with 5 YouTube videos.');
  } catch (err) {
    console.error('❌  Error updating database:', err);
  } finally {
    process.exit(0);
  }
};

run();
