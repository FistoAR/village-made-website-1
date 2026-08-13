import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

interface AdminMediaTabProps {
  newMediaUrl: string;
  setNewMediaUrl: (val: string) => void;
  handleAddMedia: (e: React.FormEvent) => void;
  mediaFiles: string[];
  setMediaFiles: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AdminMediaTab({
  newMediaUrl,
  setNewMediaUrl,
  handleAddMedia,
  mediaFiles,
  setMediaFiles,
}: AdminMediaTabProps) {
  const { showConfirm } = useApp();

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <form onSubmit={handleAddMedia} className="border border-[#d3c099] rounded-2xl p-5 bg-[#FAF4E6]/10 flex flex-col sm:flex-row gap-4 items-end font-jakarta">
        <div className="flex-grow flex flex-col gap-1 w-full">
          <label className="text-[10px] font-bold text-stone-600">Register Image to Media Library</label>
          <input
            type="text"
            required
            placeholder="Enter Image Path URL (e.g. /images/about/natural.svg)"
            value={newMediaUrl}
            onChange={(e) => setNewMediaUrl(e.target.value)}
            className="h-10 px-3.5 bg-white border border-[#d3c099] rounded-xl text-xs text-stone-900 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-[#384401] hover:bg-[#252d00] text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-colors cursor-pointer h-10 w-full sm:w-fit uppercase tracking-wider shrink-0"
        >
          Add Image
        </button>
      </form>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {mediaFiles.map((url, idx) => (
          <div key={idx} className="border border-[#d3c099] rounded-2xl overflow-hidden bg-stone-50/20 group relative shadow-2xs">
            <div className="aspect-video w-full bg-stone-150 relative">
              <img src={url} alt={`Media file ${idx}`} className="w-full h-full object-cover" />
            </div>
            <div className="p-2.5 flex items-center justify-between bg-white">
              <span className="text-[9px] text-stone-450 font-bold block truncate max-w-[100px] font-jakarta">{url.split('/').pop()}</span>
              <button
                onClick={() => {
                  showConfirm(
                    'Delete Media File',
                    'Are you sure you want to remove this asset image from the gallery media library?',
                    () => setMediaFiles(prev => prev.filter((_, i) => i !== idx))
                  );
                }}
                className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                aria-label="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
