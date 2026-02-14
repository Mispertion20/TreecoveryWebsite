import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { greenSpacesApi } from '../services/greenSpacesApi';
import { commentsApi } from '../services/commentsApi';
import { adoptionsApi } from '../services/adoptionsApi';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';
import { MapPin, Calendar, TreePine, MessageSquare, Heart, Share2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

export default function GreenSpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [greenSpace, setGreenSpace] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isAdopted, setIsAdopted] = useState(false);
  const [adopting, setAdopting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      checkAdoption();
    }
  }, [isAuthenticated, id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [space, commentsData] = await Promise.all([
        greenSpacesApi.getGreenSpace(id!),
        commentsApi.getComments(id!, { limit: 50 }),
      ]);

      setGreenSpace(space);
      setComments(commentsData.data);
    } catch (err: any) {
      console.error('Failed to load green space:', err);
      setError(err.response?.data?.error || 'Failed to load green space');
    } finally {
      setLoading(false);
    }
  };

  const checkAdoption = async () => {
    try {
      const { adopted } = await adoptionsApi.checkAdoption(id!);
      setIsAdopted(adopted);
    } catch (err) {
      // Ignore errors
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const newComment = await commentsApi.createComment({
        green_space_id: id!,
        content: commentText,
      });
      setComments([newComment, ...comments]);
      setCommentText('');
      toast.success('Comment added successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAdopt = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to adopt a tree');
      navigate('/login');
      return;
    }

    try {
      setAdopting(true);
      await adoptionsApi.adoptTree({ green_space_id: id! });
      setIsAdopted(true);
      toast.success('Tree adopted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to adopt tree');
    } finally {
      setAdopting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner fullScreen text="Loading green space..." />
      </div>
    );
  }

  if (error || !greenSpace) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage message={error || 'Green space not found'} />
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    alive: 'bg-green-100 text-green-800',
    attention_needed: 'bg-yellow-100 text-yellow-800',
    dead: 'bg-red-100 text-red-800',
    removed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-green-600 hover:text-green-700 mb-4"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {greenSpace.species_ru}
            </h1>
            {greenSpace.species_en && (
              <p className="text-xl text-gray-600">{greenSpace.species_en}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Photos Gallery */}
              {greenSpace.photos && greenSpace.photos.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-4">Photos</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {greenSpace.photos.map((photo: any) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt={greenSpace.species_ru}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2" />
                  Comments ({comments.length})
                </h2>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={isAuthenticated ? 'Add a comment...' : 'Please log in to comment'}
                    disabled={!isAuthenticated || submittingComment}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
                  />
                  <button
                    type="submit"
                    disabled={!isAuthenticated || submittingComment || !commentText.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {comment.user?.email || comment.author_name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Info Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <TreePine className="w-5 h-5 mr-2 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium capitalize">{greenSpace.type}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 mr-2 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Planted</p>
                      <p className="font-medium">
                        {format(new Date(greenSpace.planting_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[greenSpace.status] || statusColors.alive}`}>
                      {greenSpace.status.replace('_', ' ')}
                    </span>
                  </div>
                  {greenSpace.city && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{greenSpace.city.name_en}</p>
                        {greenSpace.district && (
                          <p className="text-sm text-gray-600">{greenSpace.district.name_en}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Actions</h3>
                <div className="space-y-3">
                  {!isAdopted ? (
                    <button
                      onClick={handleAdopt}
                      disabled={adopting}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      {adopting ? 'Adopting...' : 'Adopt This Tree'}
                    </button>
                  ) : (
                    <div className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 mr-2 fill-current" />
                      Adopted
                    </div>
                  )}
                  <button
                    onClick={handleShare}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-5 h-5 mr-2" />
                        Share
                      </>
                    )}
                  </button>
                  <Link
                    to={`/report?green_space_id=${id}`}
                    className="block w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-center"
                  >
                    Report Issue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

