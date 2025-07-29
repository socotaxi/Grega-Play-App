import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import eventService from '../services/eventService';
import videoService from '../services/videoService';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabaseClient';

const FinalVideoPage = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [finalVideo, setFinalVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [submittedVideos, setSubmittedVideos] = useState([]);

  const isOwner = user && event && user.id === event.user_id;

  useEffect(() => {
    const fetchSubmittedVideos = async () => {
      try {
        const videos = await videoService.getVideosByEvent(eventId);
        setSubmittedVideos(videos);
      } catch (err) {
        console.error('Erreur chargement des vidéos soumises:', err);
      }
    };

    if (isOwner) {
      fetchSubmittedVideos();
    }
  }, [event, user, eventId]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventData = await eventService.getEvent(eventId);
        setEvent(eventData);

        if (eventData.status === 'done' && eventData.final_video_url) {
          setFinalVideo(eventData.final_video_url);
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Impossible de charger les détails de l\'événement.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleGenerateVideo = async () => {
    if (!event) return;

    try {
      setProcessing(true);
      await videoService.generateFinalVideo(eventId);

      const updatedEvent = await eventService.getEvent(eventId);
      setEvent(updatedEvent);

      if (updatedEvent.final_video_url) {
        setFinalVideo(updatedEvent.final_video_url);
      }
    } catch (err) {
      console.error('Error generating video:', err);
      setError('Une erreur s\'est produite lors de la génération de la vidéo.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <Loading fullPage />;
  }

  const canStartProcessing = event &&
    (event.status === 'ready' || event.status === 'open') &&
    user &&
    (user.id === event.user_id || user.role === 'admin');

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
              {event ? event.title : 'Vidéo finale'}
            </h1>
            {event?.theme && (
              <p className="mt-1 text-sm text-gray-500">Thème: {event.theme}</p>
            )}
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
            {['open', 'ready'].includes(event?.status) && (
              <Link to={`/submit/${event.id}`}>
                <Button>Soumettre une vidéo</Button>
              </Link>
            )}
            {isOwner && (
              <Link to={`/events/${event.id}/participants`}>
                <Button variant="secondary">Inviter des participants</Button>
              </Link>
            )}
            <Link to="/dashboard">
              <Button variant="secondary">Retour au tableau de bord</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Bloc vidéo finale */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg px-4 py-5 sm:p-6">
          {finalVideo && isOwner ? (
            <>
              <h3 className="text-lg font-medium text-gray-900">Vidéo finale</h3>
              <div className="mt-4 aspect-w-16 aspect-h-9">
                <video
                  controls
                  className="w-full h-auto rounded-md shadow-lg"
                  src={finalVideo}
                >
                  Votre navigateur ne prend pas en charge la lecture de vidéos.
                </video>
              </div>
              <div className="mt-5 flex justify-center">
                <a
                  href={finalVideo}
                  download={`${event.title.replace(/\s+/g, '_')}_final.mp4`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Télécharger la vidéo
                </a>
              </div>
            </>
          ) : finalVideo && !isOwner ? (
            <>
              <h3 className="text-lg font-medium text-gray-900">🎉 La vidéo finale est prête !</h3>
              <p className="mt-2 text-sm text-gray-600">
                Elle est accessible uniquement par le créateur de l’événement. Patientez, il vous la partagera bientôt.
              </p>
            </>
          ) : event?.status === 'processing' ? (
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-indigo-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Montage en cours...</h3>
              <p className="mt-1 text-sm text-gray-500">Nous assemblons les vidéos. Cela peut prendre quelques minutes.</p>
            </div>
          ) : (
            <div className="text-center">
              {event?.video_count === 0 ? (
                <>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Pas encore de vidéos</h3>
                  <p className="mt-1 text-sm text-gray-500">Attendez que les participants soumettent leurs vidéos.</p>
                </>
              ) : canStartProcessing ? (
                <>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Prêt pour le montage</h3>
                  <p className="mt-1 text-sm text-gray-500">{event.video_count} vidéos ont été soumises. Vous pouvez maintenant générer la vidéo finale.</p>
                  <div className="mt-5">
                    <Button onClick={handleGenerateVideo} loading={processing} disabled={processing}>
                      Générer la vidéo
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">En attente</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {event.video_count} vidéos soumises. En attente de la génération de la vidéo finale.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Détails de l'événement + vidéos soumises si créateur */}
        {event && (
          <>
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Détails de l'événement</h2>
              <dl className="mt-5 divide-y divide-gray-200">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="text-sm text-gray-900 sm:col-span-2">{event.description || 'Aucune description'}</dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Date limite</dt>
                  <dd className="text-sm text-gray-900 sm:col-span-2">{new Date(event.deadline).toLocaleDateString('fr-FR')}</dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Nombre de vidéos</dt>
                  <dd className="text-sm text-gray-900 sm:col-span-2">{event.video_count || 0}</dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Statut</dt>
                  <dd className="text-sm text-gray-900 sm:col-span-2">{event.status}</dd>
                </div>
              </dl>
            </div>

            {isOwner && submittedVideos.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-medium text-gray-900 mb-4">🎥 Vidéos soumises</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {submittedVideos.map((video, index) => (
                    <div key={video.id || index} className="bg-gray-100 rounded-lg p-2 shadow">
                      <video
                        controls
                        src={supabase.storage.from('videos').getPublicUrl(video.storage_path).data.publicUrl}
                        className="w-full h-auto rounded"
                      >
                        Votre navigateur ne prend pas en charge la lecture de vidéos.
                      </video>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default FinalVideoPage;
