const eventService = {
  async getEvent(eventId) {
    const response = await fetch(`/api/events/${eventId}`);
    if (!response.ok) throw new Error("Erreur lors du chargement de l'événement");
    return response.json();
  },
  async getEventParticipants(eventId) {
    const response = await fetch(`/api/events/${eventId}/participants`);
    if (!response.ok) throw new Error("Erreur chargement participants");
    return response.json();
  },
  async createEvent(data) {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erreur lors de la création");
    return response.json();
  },
  async sendInvitations(eventId, emails, event, message = '') {
    const response = await fetch(`/api/events/${eventId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails, message }),
    });
    if (!response.ok) throw new Error("Erreur lors de l'envoi des invitations");
    return response.json();
  },
  async deleteEvent(eventId, userId) {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error("Erreur suppression événement");
    return true;
  },
  async getDashboardEvents(userId, userEmail) {
    const response = await fetch(`/api/events/dashboard?userId=${userId}&email=${userEmail}`);
    if (!response.ok) throw new Error("Erreur chargement tableau de bord");
    return response.json();
  },
};

export default eventService;
