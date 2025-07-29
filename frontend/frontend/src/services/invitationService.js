const invitationService = {
  async getInvitations(eventId) {
    const response = await fetch(`/api/events/${eventId}/invitations`);
    if (!response.ok) throw new Error("Erreur lors de la récupération des invitations");
    return response.json();
  },

  async addInvitations(eventId, emails, message = '') {
    const response = await fetch(`/api/events/${eventId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails, message }),
    });
    if (!response.ok) throw new Error("Erreur lors de l'envoi des invitations");
    return response.json();
  },

  async removeInvitation(invitationId) {
    const response = await fetch(`/api/invitations/${invitationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error("Erreur suppression invitation");
    return true;
  }
};

export default invitationService;
