
import { Button } from '@/components/ui/button';
import { Heart, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-pink-500" />
              GiftFlow
            </h3>
            <p className="text-gray-400">
              Connecting fans with their favorite influencers through thoughtful gifts.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Browse Gifts</a></li>
              <li><a href="#" className="hover:text-white">Find Influencers</a></li>
              <li><a href="#" className="hover:text-white">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Github className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 GiftFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
