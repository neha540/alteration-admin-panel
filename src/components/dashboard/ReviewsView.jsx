import React, { useState, useEffect } from 'react';
import { adminDataService } from '../../services/adminDataService';
import { Scissors, Star, Eye, EyeOff, Trash2, RefreshCw, MessageSquare, CheckCircle2, X, AlertTriangle } from 'lucide-react';

export default function ReviewsView() {
  const [reviewsData, setReviewsData] = useState({
    count: 0,
    publishedCount: 0,
    hiddenCount: 0,
    averageRating: '5.0',
    reviews: []
  });
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'published' | 'hidden'
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = () => {
    adminDataService.getReviews().then(data => {
      if (data && data.reviews) {
        setReviewsData(data);
      }
    }).catch(err => {
      console.warn('Failed to fetch reviews:', err);
    });
  };

  useEffect(() => {
    fetchReviews();
    const interval = setInterval(fetchReviews, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Published' ? 'Hidden' : 'Published';
    setActionLoading(true);
    try {
      await adminDataService.updateReviewStatus(id, newStatus);
      fetchReviews();
    } catch (err) {
      console.warn('Error updating review status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      await adminDataService.deleteReview(reviewToDelete.id);
      setReviewToDelete(null);
      fetchReviews();
    } catch (err) {
      console.warn('Error deleting review:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredReviews = (reviewsData.reviews || []).filter(r => {
    if (activeFilter === 'published') return r.status === 'Published';
    if (activeFilter === 'hidden') return r.status === 'Hidden';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
            Customer reviews
          </h1>
          <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
            Monitor feedback, ratings, and customer comments across all tailoring studios.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchReviews}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Info Callout Banner */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAF9] border border-slate-200/80 text-xs text-slate-600 leading-relaxed flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span>
          Customer reviews are tied to verified studio interactions. Hidden reviews remain in the platform moderation log but do not appear on public studio listings.
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total customer reviews</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <span className="text-3xl font-bold text-slate-900 block mt-2">{reviewsData.count || 0}</span>
          <span className="text-[11.5px] text-slate-400 block mt-1">Submitted across platform</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Average platform rating</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-slate-900">{reviewsData.averageRating || '5.0'}</span>
            <span className="text-xs text-amber-600 font-semibold">★ Out of 5.0</span>
          </div>
          <span className="text-[11.5px] text-slate-400 block mt-1">Based on verified reviews</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Published / Visible</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-slate-900">{reviewsData.publishedCount || 0}</span>
            <span className="text-xs text-slate-400">({reviewsData.hiddenCount || 0} hidden)</span>
          </div>
          <span className="text-[11.5px] text-slate-400 block mt-1">Live on customer studio pages</span>
        </div>
      </div>

      {/* Reviews Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {/* Sub-Tabs Filter */}
        <div className="px-6 border-b border-slate-100 flex items-center gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All reviews</span>
            <span className="text-[11px] text-slate-400">({reviewsData.count || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('published')}
            className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'published'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Published</span>
            <span className="text-[11px] text-slate-400">({reviewsData.publishedCount || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('hidden')}
            className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'hidden'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Hidden</span>
            <span className="text-[11px] text-slate-400">({reviewsData.hiddenCount || 0})</span>
          </button>
        </div>

        {/* Content Table or Empty State */}
        {filteredReviews.length === 0 ? (
          <div className="p-12 sm:p-20 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-400 mb-4">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {activeFilter === 'hidden' ? 'No hidden reviews' : 'No customer reviews yet'}
            </h3>

            <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
              When customers complete alterations and submit ratings from the studio page, reviews will appear here for moderation.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map((rev) => {
              const isPublished = rev.status === 'Published';
              const createdDate = rev.createdAt 
                ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent';

              return (
                <div
                  key={rev.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/60 transition flex flex-col lg:flex-row lg:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {rev.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {rev.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">
                        Studio: {rev.studioName || 'Studio'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        · {createdDate}
                      </span>
                    </div>

                    {/* Stars & Garment */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= (Number(rev.rating) || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {rev.rating}.0
                      </span>
                      {rev.garmentType && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-600 font-medium">
                          {rev.garmentType}
                        </span>
                      )}
                    </div>

                    {/* Review text */}
                    <p className="text-xs sm:text-[13px] text-slate-700 font-normal leading-relaxed max-w-3xl">
                      "{rev.comment}"
                    </p>

                    {/* Customer Info */}
                    <div className="text-[11px] text-slate-400 pt-1">
                      By <span className="font-semibold text-slate-700">{rev.customerName || 'Verified Customer'}</span>
                      {rev.customerEmail && <span> ({rev.customerEmail})</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleToggleStatus(rev.id, rev.status)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                        isPublished
                          ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isPublished ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>Hide review</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Publish</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading || isDeleting}
                      onClick={() => setReviewToDelete(rev)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal Popup */}
      {reviewToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto font-['Arial',sans-serif]">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    Delete review?
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {reviewToDelete.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setReviewToDelete(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                Are you sure you want to delete this review? This action cannot be undone and will permanently remove this review from the platform and customer studio profile.
              </p>

              {/* Review Preview Snippet Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span>{reviewToDelete.customerName || 'Verified Customer'}</span>
                  <div className="flex items-center text-amber-500 gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= (Number(reviewToDelete.rating) || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-bold text-slate-800 ml-1">
                      {reviewToDelete.rating}.0
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                  "{reviewToDelete.comment}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>Studio: <strong className="text-slate-700">{reviewToDelete.studioName || 'Studio'}</strong></span>
                  {reviewToDelete.garmentType && (
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[10px]">
                      {reviewToDelete.garmentType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer CTAs */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setReviewToDelete(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, delete review'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
