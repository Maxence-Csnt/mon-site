import pg from 'pg';
const { Pool } = pg;

// 🛠️ Configuration compatible à 100% avec Neon et Vercel
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // 🏗️ Crée la table automatiquement si elle n'existe pas (évite le crash au premier chargement)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        icon VARCHAR(255),
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 🔍 Récupère les services triés du plus récent au plus ancien
    const result = await pool.query('SELECT * FROM services ORDER BY created_at DESC');
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erreur SQL:', error);
    return res.status(500).json({ error: 'Erreur de connexion à la base de données Neon.' });
  }
}
