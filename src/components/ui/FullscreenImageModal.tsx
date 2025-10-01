import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface FullscreenImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function FullscreenImageModal({ isOpen, onClose, imageUrl }: FullscreenImageModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 bg-transparent border-none w-[95vw] sm:w-auto sm:max-w-[90vw] max-h-[90vh]">
        <div className="relative">
          <img src={imageUrl} alt="Fullscreen view" className="object-contain w-full h-full max-w-full max-h-[85vh] sm:max-h-[90vh]" />
          <DialogClose asChild>
            <button className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-2 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
