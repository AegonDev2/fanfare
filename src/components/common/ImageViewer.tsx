import React from 'react';
import { OptimizedImage } from './OptimizedImage';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <div className={className} onClick={() => setIsOpen(true)} style={{ cursor: 'pointer' }}>
        <OptimizedImage src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <OptimizedImage 
            src={src} 
            alt={alt} 
            className="w-full h-auto"
            priority
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
