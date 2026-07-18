import pg from 'pg';
const { Pool } = pg;

// Connexion à PostgreSQL via la variable d'environnement fournie par Vercel/Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  // On autorise uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { title, icon, description } = req.body;

    // Sécurité de base : vérifier que les champs obligatoires sont présents
    if (!title || !description) {
      return res.status(400).json({ error: 'Le titre et la description sont requis.' });
    }

    // Insertion du service dans la table PostgreSQL
    // (Ajuste les noms de colonnes ou de la table "services" selon ton schéma actuel)
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
    return res.status(500).json({ error: 'Erreur lors de la sauvegarde en base de données.' });
  }
}
