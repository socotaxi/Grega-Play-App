const videoService = {
  async uploadVideo(file, eventId, userId = null, participantName = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    formData.append('participantName', participantName);
    if (userId) formData.append('userId', userId);

    const response = await fetch('/api/videos/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error("Erreur lors de l'envoi de la vidéo");
    return response.json();
  },

  async generateFinalVideo(eventId) {
    const response = await fetch(`/api/videos/process?eventId=${eventId}`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error("Erreur génération vidéo");
    return response.json();
  }
};

export default videoService;
