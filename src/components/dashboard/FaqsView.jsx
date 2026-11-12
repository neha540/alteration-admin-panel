import React, { useState, useEffect } from 'react';
import { adminDataService } from '../../services/adminDataService';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Eye,
  EyeOff,
  Filter,
  Check
} from 'lucide-react';

export default function FaqsView() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    placement: 'both',
    status: 'Active',
    order: 1
  });
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const fetchFaqs = () => {
    setLoading(true);
    adminDataService.getFaqs({ category: activeCategory, search: searchQuery })
      .then(data => {
        if (Array.isArray(data)) {
          setFaqs(data);
        }
      })
      .catch(err => {
        console.warn('Failed to load FAQs:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaqs();
  }, [activeCategory]);

  const categories = ['All', 'General', 'Pricing & Quotes', 'Fittings & Measurements', 'Studios & Partners'];

  const filteredFaqs = faqs.filter(f => {
    if (activeCategory !== 'All' && f.category?.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (f.question && f.question.toLowerCase().includes(q)) ||
        (f.answer && f.answer.toLowerCase().includes(q)) ||
        (f.category && f.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage) || 1;
  const paginatedFaqs = filteredFaqs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      placement: 'both',
      status: 'Active',
      order: faqs.length + 1
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || faq.q || '',
      answer: faq.answer || faq.a || '',
      category: faq.category || 'General',
      placement: faq.placement || 'both',
      status: faq.status || 'Active',
      order: faq.order || 1
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      setFormError('Question is required.');
      return;
    }
    if (!formData.answer.trim()) {
      setFormError('Answer is required.');
      return;
    }
    setIsSaving(true);
    try {
      if (editingFaq) {
        await adminDataService.updateFaq(editingFaq.id, formData);
        showToast('FAQ updated successfully!');
      } else {
        await adminDataService.createFaq(formData);
        showToast('New FAQ created successfully!');
      }
      setModalOpen(false);
      fetchFaqs();
    } catch (err) {
      setFormError(err.message || 'Failed to save FAQ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!faqToDelete) return;
    setIsDeleting(true);
    try {
      await adminDataService.deleteFaq(faqToDelete.id);
      showToast('FAQ deleted successfully.');
      setFaqToDelete(null);
      fetchFaqs();
    } catch (err) {
      alert(err.message || 'Failed to delete FAQ.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (faq) => {
    const newStatus = faq.status === 'Active' ? 'Hidden' : 'Active';
    try {
      await adminDataService.updateFaq(faq.id, { status: newStatus });
      showToast(`FAQ marked as ${newStatus}.`);
      fetchFaqs();
    } catch (err) {
      console.warn('Failed to toggle status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-2.5">
            <span>Frequently Asked Questions</span>
          </h1>
          <p className="text-[13.5px] text-slate-500 font-normal mt-1 leading-relaxed">
            Manage FAQs across the customer Home page and Help Center portal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#2361E9] hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          <span>Add new question</span>
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {/* Controls: Search & Category Pills */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {categories.map(cat => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search questions or answers..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-600 transition"
            />
          </div>
        </div>

        {/* FAQs List Table / Cards */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading questions...</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-700">No FAQs found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery ? 'Try clearing your search query.' : 'Click "Add new question" to create your first FAQ.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              const isActive = faq.status === 'Active' || !faq.status;

              return (
                <div key={faq.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1.5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : faq.id)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 font-mono">
                          #{faq.order || '—'}
                        </span>
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          faq.category === 'Pricing & Quotes'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : faq.category === 'Fittings & Measurements'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {faq.category || 'General'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {faq.placement === 'home' ? 'Home only' : faq.placement === 'help' ? 'Help Center only' : 'Home & Help'}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isActive ? '● Active' : '○ Hidden'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                        {faq.question || faq.q}
                      </h3>

                      <p className={`text-xs text-slate-600 leading-relaxed font-normal ${
                        isExpanded ? 'mt-2' : 'line-clamp-2 text-slate-500'
                      }`}>
                        {faq.answer || faq.a}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(faq)}
                        title={isActive ? 'Hide FAQ' : 'Publish FAQ'}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition cursor-pointer"
                      >
                        {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(faq)}
                        title="Edit FAQ"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setFaqToDelete(faq)}
                        title="Delete FAQ"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {filteredFaqs.length > itemsPerPage && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFaqs.length)} of {filteredFaqs.length} questions
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
              >
                Previous
              </button>
              <span className="px-2 font-mono font-medium text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit FAQ Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={handleSaveFaq}
            className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This question will appear dynamically on the customer website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-lg font-medium">
                {formError}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. How does fitting and drop-off work?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Provide a comprehensive, reassuring explanation for customers..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 bg-white cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Pricing & Quotes">Pricing & Quotes</option>
                    <option value="Fittings & Measurements">Fittings & Measurements</option>
                    <option value="Studios & Partners">Studios & Partners</option>
                    <option value="Orders & Delivery">Orders & Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Where to display</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 bg-white cursor-pointer"
                  >
                    <option value="both">Both (Home & Help Center)</option>
                    <option value="home">Home Page Only</option>
                    <option value="help">Help Center Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 bg-white cursor-pointer"
                  >
                    <option value="Active">Active (Visible)</option>
                    <option value="Hidden">Hidden (Draft)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sort order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-semibold bg-[#2361E9] hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSaving ? 'Saving...' : editingFaq ? 'Save Changes' : 'Create FAQ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {faqToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Delete this question?</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                "{faqToDelete.question || faqToDelete.q}"
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setFaqToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition cursor-pointer shadow-xs"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1 leading-snug">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-slate-400 hover:text-white ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
