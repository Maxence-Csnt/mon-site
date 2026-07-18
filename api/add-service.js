import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { title, icon, description, password } = req.body;

    // 🔒 Vérification du mot de passe admin
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Accès refusé : Mot de passe incorrect.' });
    }

    if (!title || !description) {
      return res.status(400).json({ error: 'Le titre et la description sont requis.' });
    }

    // 🏗️ Crée la table automatiquement si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        icon VARCHAR(255),
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 📨 Insertion du service
    const query = `
      INSERT INTO services (title, icon, description, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    const values = [title, icon, description];
    const result = await pool.query(query, values);

    return res.status(200).json({ success: true, service: result.rows[0] });
  } catch (error) {
    console.error('Erreur SQL:', error);
    return res.status(500).json({ error: 'Erreur de connexion à la base de données Neon.' });
  }
}
