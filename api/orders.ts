
import { createPool } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const { rows } = await pool.sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 300`;
      
      const orders = rows.map(row => ({
        id: row.id,
        type: row.type || 'DINE_IN',
        tableNumber: row.table_number !== null ? Number(row.table_number) : undefined,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
        total: Number(row.total),
        status: row.status,
        createdAt: Number(row.created_at),
        orderDate: row.order_date,
        paymentStatus: row.payment_status || 'UNPAID',
        paymentMethod: row.payment_method,
        origin: row.origin || 'OFFLINE',
        customerId: row.customer_id,
        paymentProof: row.payment_proof,
        courierName: row.courier_name,
        isReceived: row.is_received
      }));
      
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const { id, type, tableNumber, items, total, status, createdAt, paymentStatus, origin, customerId } = req.body;
      
      const itemsJson = JSON.stringify(items);
      const pStatus = (paymentStatus || 'UNPAID').toUpperCase();
      const oOrigin = (origin || 'OFFLINE').toUpperCase();
      const oType = (type || 'DINE_IN').toUpperCase();
      const tNum = tableNumber ? Number(tableNumber) : null;
      const oTotal = Number(total);
      const oTime = createdAt ? Number(createdAt) : Date.now();
      const oDate = new Date(oTime).toISOString().split('T')[0];

      await pool.sql`
        INSERT INTO orders (id, type, table_number, items, total, status, created_at, order_date, payment_status, origin, customer_id)
        VALUES (${id}, ${oType}, ${tNum}, ${itemsJson}, ${oTotal}, ${status || 'PENDING'}, ${oTime}, ${oDate}, ${pStatus}, ${oOrigin}, ${customerId || null})
      `;
      
      return res.status(201).json({ success: true, message: "Order stored" });
    }

    if (req.method === 'PATCH') {
      const { id, status, paymentStatus, paymentMethod, items, total, paymentProof, courierName, isReceived } = req.body;
      
      if (items !== undefined && total !== undefined) {
        // Update Items (Waiter menambah pesanan)
        const itemsJson = JSON.stringify(items);
        await pool.sql`UPDATE orders SET items = ${itemsJson}, total = ${Number(total)} WHERE id = ${id}`;
      } 
      else if (paymentProof !== undefined) {
        // Customer Upload Bukti Bayar
        // Kolom payment_proof bertipe TEXT, cukup untuk menyimpan Base64 string gambar (Blob simulation)
        await pool.sql`UPDATE orders SET payment_proof = ${paymentProof} WHERE id = ${id}`;
      }
      else if (courierName !== undefined) {
        // Kasir/Admin Set Kurir & Status Pengiriman
        await pool.sql`UPDATE orders SET courier_name = ${courierName}, status = 'ON_DELIVERY' WHERE id = ${id}`;
      }
      else if (isReceived !== undefined) {
        // Customer Konfirmasi Terima Barang
        await pool.sql`UPDATE orders SET is_received = ${isReceived}, status = 'SERVED' WHERE id = ${id}`;
      }
      else if (paymentStatus === 'PAID') {
        // Atomic Update & Transaction record (Kasir Approve Payment)
        const now = Date.now();
        const date = new Date(now).toISOString().split('T')[0];
        
        // Get order details first for the transaction log
        const { rows } = await pool.sql`SELECT total FROM orders WHERE id = ${id}`;
        const amount = rows[0]?.total || 0;

        await pool.sql`
          UPDATE orders 
          SET status = ${status || 'PAID'}, payment_status = 'PAID', payment_method = ${paymentMethod}
          WHERE id = ${id}
        `;

        await pool.sql`
          INSERT INTO transactions (id, order_id, amount, payment_method, created_at, transaction_date)
          VALUES (${'TX-' + id}, ${id}, ${amount}, ${paymentMethod}, ${now}, ${date})
        `;
      } else if (status) {
        // Update Status Umum
        await pool.sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error("Orders API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
