const videoService = {
  async uploadVideo(file, eventId, userId = null, participantName = '') {
    const formData = new FormData();
    formData.append('video', file); // ✅ correspond à upload.single('video') dans server.js
    formData.append('eventId', eventId);
    if (userId) formData.append('userId', userId);
    if (participantName) formData.append('participantName', participantName);

    const response = await fetch(`http://localhost:3000/api/videos/upload?eventId=${eventId}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error("Erreur lors de l'envoi de la vidéo");
    return response.json();
  },

  async generateFinalVideo(eventId) {
    const response = await fetch(`http://localhost:3000/api/videos/process?eventId=${eventId}`, {
      method: 'POST'
    });

    if (!response.ok) throw new Error("Erreur génération vidéo");
    return response.json();
  },

  async getVideosByEvent(eventId) {
    const response = await fetch(`/api/videos?eventId=${eventId}`);
    if (!response.ok) throw new Error("Erreur chargement des vidéos");
    return response.json();
  },

  async getMyVideoForEvent(eventId, participantName) {
    const response = await fetch(`/api/videos/my?eventId=${eventId}&name=${encodeURIComponent(participantName)}`);
    if (!response.ok) throw new Error("Erreur récupération de la vidéo");
    return response.json();
  },

  async deleteVideo(videoId) {
    const response = await fetch(`/api/videos/${videoId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error("Erreur suppression vidéo");
    return response.json();
  }
};

export default videoService;
