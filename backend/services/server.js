import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import processVideo from './processVideo.js';

dotenv.config();

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.send('🚀 Backend Grega Play opérationnel');
});

// ✅ Route d'upload de vidéos
const upload = multer({ dest: 'uploads/' });

app.post('/api/videos/upload', upload.single('video'), async (req, res) => {
  const { eventId } = req.query;

  if (!eventId || !req.file) {
    return res.status(400).json({ error: 'eventId ou fichier manquant.' });
  }

  const tmpDir = path.join('tmp', eventId);
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const ext = path.extname(req.file.originalname) || '.mp4';
  const newFilename = `video${uuidv4()}${ext}`;
  const newPath = path.join(tmpDir, newFilename);

  fs.rename(req.file.path, newPath, err => {
    if (err) {
      console.error('Erreur lors du déplacement du fichier :', err);
      return res.status(500).json({ error: 'Erreur serveur.' });
    }
    return res.json({ success: true, path: newPath });
  });
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
