
import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageViewerProps {
  imageUrl: string;
  alt?: string;
}

const ImageViewer = ({ imageUrl, alt = "Preview image" }: ImageViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="cursor-pointer w-full h-full relative group"
        onClick={() => setIsOpen(true)}
      >
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">Click to view</span>
        </div>
        <img 
          src={imageUrl} 
          alt={alt}
          className="w-full h-full object-contain"
        />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] p-0 bg-transparent border-none shadow-none">
          <div className="relative bg-black/90 rounded-lg overflow-hidden">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white hover:bg-black/80 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center justify-center max-h-[90vh] p-2">
              <img 
                src={imageUrl} 
                alt={alt}
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageViewer;
