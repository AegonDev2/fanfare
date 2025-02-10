
import { Youtube, Instagram, Twitter, Facebook } from "lucide-react";

interface SocialLinksProps {
  youtubeUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
}

const SocialLinks = ({ youtubeUrl, instagramUrl, twitterUrl, facebookUrl }: SocialLinksProps) => {
  return (
    <div className="flex gap-4">
      {youtubeUrl && (
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-red-600 transition-colors"
        >
          <Youtube size={24} />
        </a>
      )}
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-pink-600 transition-colors"
        >
          <Instagram size={24} />
        </a>
      )}
      {twitterUrl && (
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-blue-400 transition-colors"
        >
          <Twitter size={24} />
        </a>
      )}
      {facebookUrl && (
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Facebook size={24} />
        </a>
      )}
    </div>
  );
};

export default SocialLinks;
