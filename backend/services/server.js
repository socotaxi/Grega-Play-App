const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const processVideo = require('./processVideo');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Route de test
app.get('/', (req, res) => {
  res.send('🚀 Backend Grega Play opérationnel');
});

// ✅ Route d'upload de vidéos avec insertion Supabase
const upload = multer({ dest: 'uploads/' });

app.post('/api/videos/upload', upload.single('video'), async (req, res) => {
  const { eventId, participantName } = req.query;
  const file = req.file;

  if (!eventId || !file) {
    return res.status(400).json({ error: 'eventId ou fichier manquant.' });
  }

  // Lire la vidéo uploadée
  const buffer = fs.readFileSync(file.path);
  const ext = path.extname(file.originalname) || '.mp4';
  const filename = `${Date.now()}-${file.originalname}`;
  const storagePath = `submissions/${eventId}/${filename}`;

  // Upload dans Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(storagePath, buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (uploadError) {
    console.error('Erreur upload Supabase:', uploadError);
    return res.status(500).json({ error: 'Erreur upload vidéo.' });
  }

  // Enregistrement dans la table 'videos'
  const { error: insertError } = await supabase
    .from('videos')
    .insert({
      event_id: eventId,
      participant_name: participantName || 'Anonyme',
      storage_path: storagePath,
      status: 'validated'
    });

  if (insertError) {
    console.error('Erreur insertion DB:', insertError);
    return res.status(500).json({ error: 'Erreur enregistrement base de données.' });
  }

  // Supprimer le fichier temporaire
  fs.unlinkSync(file.path);

  res.json({ success: true, path: storagePath });
});

// ✅ Route de génération de vidéo finale
app.post('/api/videos/process', async (req, res) => {
  const { eventId } = req.query;

  if (!eventId) {
    return res.status(400).json({ error: 'eventId manquant.' });
  }

  console.log(`🎬 Démarrage du montage pour l'événement : ${eventId}`);

  try {
    const finalVideoUrl = await processVideo(eventId);
    return res.json({ success: true, finalVideoUrl });
  } catch (error) {
    console.error('❌ Erreur génération vidéo :', error);
    return res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Backend Grega Play en écoute sur http://localhost:${PORT}`);
});
