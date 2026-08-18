import React, { useState, useMemo } from 'react';
import { 
  X, Plus, Search, Edit2, Trash2, Play,
  ExternalLink
} from 'lucide-react';
import { useApp, GalleryItem } from '@/lib/context/AppContext';

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// Helper to extract YouTube Video ID
const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : null;
};

// Helper to get YouTube Thumbnail
const getYouTubeThumbnail = (url: string): string => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '/images/product-section/product-placeholder-rimage.webp';
};

export default function AdminMediaTab() {
  const { 
    galleryItems, 
    createGalleryItem, 
    updateGalleryItem, 
    deleteGalleryItem, 
    showConfirm,
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(0);
  const [formActive, setFormActive] = useState(true);

  // Preview / Lightbox state
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  // Reset form
  const resetForm = (item: GalleryItem | null = null) => {
    if (item) {
      setFormTitle(item.title);
      setFormUrl(item.url);
      setFormDisplayOrder(item.display_order);
      setFormActive(item.active);
      setEditingItem(item);
    } else {
      setFormTitle('');
      setFormUrl('');
      setFormDisplayOrder(galleryItems.length + 1);
      setFormActive(true);
      setEditingItem(null);
    }
  };

  const handleOpenAddDrawer = () => {
    resetForm(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (item: GalleryItem) => {
    resetForm(item);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    if (!getYouTubeId(formUrl)) {
      showToast('Please enter a valid YouTube video URL', 'error');
      return;
    }

    const payload = {
      title: formTitle,
      url: formUrl,
      type: 'youtube' as const,
      display_order: Number(formDisplayOrder),
      active: formActive
    };

    if (editingItem) {
      const res = await updateGalleryItem(editingItem.id, payload);
      if (res.success) {
        showToast('Gallery video updated successfully!', 'success');
        handleCloseDrawer();
      } else {
        showToast(res.error || 'Failed to update gallery video', 'error');
      }
    } else {
      const res = await createGalleryItem(payload);
      if (res.success) {
        showToast('YouTube video added to gallery!', 'success');
        handleCloseDrawer();
      } else {
        showToast(res.error || 'Failed to create gallery video', 'error');
      }
    }
  };

  const handleDelete = (item: GalleryItem) => {
    showConfirm(
      'Delete Gallery Video',
      `Are you sure you want to permanently remove "${item.title}" from the gallery?`,
      async () => {
        const res = await deleteGalleryItem(item.id);
        if (res.success) {
          showToast('Gallery video deleted!', 'success');
        } else {
          showToast(res.error || 'Failed to delete gallery video', 'error');
        }
      }
    );
  };

  const handleToggleStatus = async (item: GalleryItem) => {
    const res = await updateGalleryItem(item.id, { active: !item.active });
    if (res.success) {
      showToast(`"${item.title}" is now ${!item.active ? 'Visible' : 'Hidden'} in gallery`, 'success');
    } else {
      showToast('Failed to update status', 'error');
    }
  };

  const youTubeVideoId = getYouTubeId(formUrl);

  // Filtered gallery items — YouTube only
  const filteredItems = useMemo(() => {
    return galleryItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [galleryItems, searchQuery]);

  return (
    <div className="space-y-6 font-jakarta relative">
      {/* Title & Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 uppercase tracking-widest">Gallery Media</h2>
          <p className="text-xs text-stone-600">Manage YouTube videos displayed in the public Gallery section. Toggle visibility to show or hide.</p>
        </div>
        <button
          onClick={handleOpenAddDrawer}
          className="flex items-center gap-2 bg-[#C56C4F] hover:bg-[#a85237] text-white text-xs font-black py-2.5 px-5 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add YouTube Video
        </button>
      </div>

      {/* Search & Filter */}
      <div className="relative max-w-md w-full">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Search gallery media..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 pl-10 pr-4 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 w-full focus:outline-none focus:border-[#C56C4F]"
        />
      </div>

      {/* Media Grid / Table */}
      <div className="bg-white border border-[#eeddb9] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF4E6]/50 border-b border-[#eeddb9]/60 text-[10px] font-black uppercase tracking-wider text-stone-600">
                <th className="py-4 px-4.5 w-12 text-center">#</th>
                <th className="py-4 px-4">Thumbnail</th>
                <th className="py-4 px-4">Video Title</th>
                <th className="py-4 px-4 w-28 text-center">Order</th>
                <th className="py-4 px-4 w-36 text-center">Visible in Gallery</th>
                <th className="py-4 px-4 w-36">Last Updated</th>
                <th className="py-4 px-4.5 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeddb9]/30 text-xs font-medium text-stone-750">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 font-semibold">
                    No YouTube videos added yet. Click &quot;Add YouTube Video&quot; to get started.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const thumbnail = getYouTubeThumbnail(item.url);
                  return (
                    <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3.5 px-4.5 text-center font-bold text-stone-400">{index + 1}</td>
                      <td className="py-3.5 px-4">
                        <div 
                          onClick={() => setPreviewItem(item)}
                          className="w-20 h-12 rounded-lg overflow-hidden bg-stone-100 border border-stone-200/60 relative cursor-pointer group shadow-3xs"
                        >
                          <img src={thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center text-white">
                            <Play className="w-4 h-4 fill-white" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-extrabold text-stone-900 block truncate">{item.title}</span>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-red-500 font-medium hover:underline flex items-center gap-1 mt-0.5 truncate"
                        >
                          <Youtube className="w-2.5 h-2.5 shrink-0" />
                          {item.url} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-stone-900">{item.display_order}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            item.active ? 'bg-[#384401]' : 'bg-stone-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              item.active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-[10px] font-black block mt-1 uppercase ${ item.active ? 'text-[#384401]' : 'text-stone-400' }`}>
                          {item.active ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 font-bold">
                        {item.last_updated ? new Date(item.last_updated).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        }) : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditDrawer(item)}
                            className="p-1.5 hover:bg-stone-100 text-stone-500 hover:text-[#384401] rounded-lg transition-colors cursor-pointer"
                            title="Edit Media"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-650 rounded-lg transition-colors cursor-pointer"
                            title="Delete Media"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Drawer (Add / Edit) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[500] flex justify-end animate-fade-in bg-black/45 backdrop-blur-xs">
          <div 
            className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col gap-5 animate-slide-left border-l border-[#eeddb9] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#eeddb9]/60 pb-4">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-black text-stone-900 uppercase tracking-widest">
                  {editingItem ? 'Edit YouTube Video' : 'Add YouTube Video'}
                </h3>
              </div>
              <button 
                onClick={handleCloseDrawer}
                className="p-1 hover:bg-stone-100 text-stone-400 hover:text-stone-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body / Form */}
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              {/* Live YouTube Preview */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-stone-600 tracking-wider">Live Preview</label>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-100 border border-[#eeddb9] flex items-center justify-center relative shadow-3xs">
                  {formUrl.trim() && youTubeVideoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youTubeVideoId}`}
                      className="w-full h-full border-0"
                      allowFullScreen
                      title="YouTube Preview"
                    ></iframe>
                  ) : (
                    <div className="text-center p-6 flex flex-col items-center gap-2">
                      <Youtube className="w-8 h-8 text-red-400" />
                      <span className="text-[11px] text-stone-450 font-bold">
                        {formUrl.trim() ? 'Invalid YouTube URL — double-check the link.' : 'Paste a YouTube URL below to preview it here'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title Field */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-stone-600 tracking-wider">Video Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Our Village Journey"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-10 px-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C56C4F] w-full"
                />
              </div>

              {/* YouTube URL Field */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-stone-600 tracking-wider">YouTube Video URL *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="h-10 pl-9 pr-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C56C4F] w-full"
                  />
                </div>
                {formUrl.trim() && !youTubeVideoId && (
                  <span className="text-[10px] text-red-500 font-bold">⚠ Not a valid YouTube URL</span>
                )}
                {formUrl.trim() && youTubeVideoId && (
                  <span className="text-[10px] text-[#384401] font-bold">✓ Valid YouTube video detected</span>
                )}
              </div>

              {/* Display Order Field */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-stone-600 tracking-wider">Display Order (weight) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                  className="h-10 px-3.5 bg-white border border-[#eeddb9] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C56C4F] w-full"
                />
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between border border-[#eeddb9]/40 p-4 rounded-xl bg-[#FAF4E6]/25">
                <div>
                  <span className="text-xs font-extrabold text-stone-900 block">Visible in Gallery</span>
                  <span className="text-[10px] text-stone-500 font-medium">Toggle to show or hide this video on the public website</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormActive(!formActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formActive ? 'bg-[#384401]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      formActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className={`-mt-3 text-[10px] font-black uppercase ${ formActive ? 'text-[#384401]' : 'text-stone-400' }`}>
                {formActive ? '● Visible — will appear in gallery' : '○ Hidden — will not appear in gallery'}
              </p>
              
              {/* Drawer Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#eeddb9]/60 mt-auto">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="h-11 border border-stone-300 hover:border-stone-400 bg-white text-stone-700 text-xs font-black rounded-xl cursor-pointer uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 bg-[#384401] hover:bg-[#252d00] text-white text-xs font-black rounded-xl shadow-md uppercase tracking-wider cursor-pointer"
                >
                  {editingItem ? 'Update Media' : 'Save Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Video Modal */}
      {previewItem && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewItem(null)}
        >
          <div 
            className="w-full max-w-4xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewItem(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-stone-300 bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[#eeddb9]/30 shadow-2xl">
              {getYouTubeId(previewItem.url) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(previewItem.url)}?autoplay=1`}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={previewItem.title}
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <span className="text-sm font-bold">Unable to load video</span>
                </div>
              )}
            </div>

            <div className="text-white mt-4 text-center">
              <h4 className="text-base font-extrabold uppercase tracking-wider">{previewItem.title}</h4>
              <p className="text-xs text-stone-400 mt-1">{previewItem.url}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
