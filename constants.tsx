
import { MenuItem } from './types';

// Optimization params: q=40 (quality 40%), w=320 (width 320px), auto=format (next-gen webp/avif)
const OPT = 'q=40&w=320&auto=format&fit=crop';

export const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'Nasi + Rendang', price: 26000, category: 'FOOD', stock: 100, imageUrl: `https://images.unsplash.com/photo-1626074353765-517a681e40be?${OPT}` },
  { id: '2', name: 'Nasi + Ayam Goreng', price: 23000, category: 'FOOD', stock: 100, imageUrl: `https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?${OPT}` },
  { id: '3', name: 'Nasi + Ayam Bakar', price: 23000, category: 'FOOD', stock: 100, imageUrl: `https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?${OPT}` },
  { id: '4', name: 'Nasi + Ayam Telur Dadar', price: 20000, category: 'FOOD', stock: 100, imageUrl: `https://images.unsplash.com/photo-1518492104633-130d0cc84637?${OPT}` },
  { id: '5', name: 'Nasi + Tunjang', price: 27500, category: 'FOOD', stock: 100, imageUrl: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?${OPT}` },
  { id: '6', name: 'Rendang Premium', price: 20000, category: 'FOOD', stock: 100, imageUrl: `https://images.unsplash.com/photo-1541544741938-0af808b77e40?${OPT}` },
  { id: '7', name: 'Ayam Goreng Lengkuas', price: 16000, category: 'FOOD', stock: 100, imageUrl: `https://images.unsplash.com/photo-1567620832903-9fc6debc209f?${OPT}` },
  { id: '8', name: 'Ayam Bakar Spesial', price: 16000, category: 'FOOD', stock: 100, imageUrl: `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?${OPT}` },
  { id: '9', name: 'Telur Dadar Barembo', price: 14000, category: 'FOOD', stock: 100, imageUrl: `https://images.unsplash.com/photo-1525351484163-7529414344d8?${OPT}` },
  { id: '10', name: 'Sayur Nangka Kapau', price: 10000, category: 'FOOD', stock: 100, imageUrl: `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?${OPT}` },
  { id: '11', name: 'Jengkol Balado Luxury', price: 31000, category: 'FOOD', stock: 100, imageUrl: `https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?${OPT}` },
  { id: '12', name: 'Es Kelapa Jeruk Segar', price: 25000, category: 'DRINK', stock: 100, imageUrl: `https://images.unsplash.com/photo-1544145945-f904253d0c7b?${OPT}` },
  { id: '13', name: 'Es Teh Manis', price: 3000, category: 'DRINK', stock: 100, imageUrl: `https://images.unsplash.com/photo-1556679343-c7306c1976bc?${OPT}` },
  { id: '14', name: 'Teh Hangat', price: 2000, category: 'DRINK', stock: 100, imageUrl: `https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?${OPT}` },
  { id: '15', name: 'Es Jeruk Peras', price: 10000, category: 'DRINK', stock: 100, imageUrl: `https://images.unsplash.com/photo-1613478223719-2ab802602423?${OPT}` },
];

export const TABLES_COUNT = 12;
