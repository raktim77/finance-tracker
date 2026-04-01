import { useState, useCallback } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

interface Props {
  image: string;
  onClose: () => void;
  onSave: (croppedAreaPixels: Area) => void;
  isSaving?: boolean;
}

export default function CropperModal({ image, onClose, onSave, isSaving = false }: Props) {
  // Point type ensures x and y are numbers
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  
  // Area type provides { x, y, width, height }
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Replaces (_: any, croppedPixels: any) with strictly typed versions
  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[2.5rem] bg-[var(--color-surface)] border border-[var(--border)] p-6 shadow-2xl space-y-6">
        
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">
            Adjust Photo
          </h3>
          <p className="text-[10px] font-bold text-[var(--color-text-secondary)] opacity-80 uppercase tracking-tighter">
            Drag to reposition • Scroll or pinch to zoom
          </p>
        </div>

        {/* Crop area container */}
        <div className="relative w-full h-80 rounded-3xl overflow-hidden border border-[var(--border)] bg-black/20">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            // Custom styling to match your premium vibe
            style={{
              containerStyle: { borderRadius: '1.5rem' },
            }}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!croppedAreaPixels || isSaving}
            onClick={() => croppedAreaPixels && onSave(croppedAreaPixels)}
            className="px-6 py-3 rounded-2xl bg-[var(--color-primary)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--color-primary)]/20 active:scale-95 transition-all disabled:opacity-30"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
