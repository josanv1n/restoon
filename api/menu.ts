
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { rows } = await pool.sql`SELECT * FROM menu_items ORDER BY category, name`;
    return res.json(rows.map(r => ({ 
      ...r, 
      price: Number(r.price),
      imageUrl: r.image_url // Mapping snake_case from DB to camelCase for UI
    })));
  }

  if (req.method === 'POST') {
    const { id, name, category, price, stock, imageUrl } = req.body;
    await pool.sql`
      INSERT INTO menu_items (id, name, category, price, stock, image_url)
      VALUES (${id}, ${name}, ${category}, ${price}, ${stock}, ${imageUrl || null})
      ON CONFLICT (id) DO UPDATE 
      SET name = EXCLUDED.name, category = EXCLUDED.category, price = EXCLUDED.price, stock = EXCLUDED.stock, image_url = EXCLUDED.image_url
    `;
    return res.json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    await pool.sql`DELETE FROM menu_items WHERE id = ${id as string}`;
    return res.json({ success: true });
  }

  return res.status(405).end();
}
