import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  // On autorise uniquement les requêtes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupération de tous les services, triés du plus récent au plus ancien
    const query = `SELECT * FROM services ORDER BY created_at DESC;`;
    const result = await pool.query(query);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erreur SQL:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des services.' });
  }
}
