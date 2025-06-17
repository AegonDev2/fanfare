
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Gift, Twitter, Instagram, Youtube, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Gift className="h-8 w-8 text-funky-purple" />
              <span className="text-2xl font-bold font-display bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
                GiftFlow
              </span>
            </div>
            <p className="text-gray-400 font-body mb-4">
              Connecting fans with their favorite influencers through meaningful gifts.
            </p>
            <div className="flex space-x-3">
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-funky-purple">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-funky-purple">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-funky-purple">
                <Youtube className="h-5 w-5" />
              </Button>
              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-funky-purple">
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold font-display mb-4">Quick Links</h3>
            <ul className="space-y-2 font-body">
              <li>
                <Button 
                  variant="link" 
                  className="text-gray-400 hover:text-funky-purple p-0 h-auto"
                  onClick={() => navigate('/gift-selection')}
                >
                  Send Gifts
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="text-gray-400 hover:text-funky-purple p-0 h-auto"
                  onClick={() => navigate('/leaderboard')}
                >
                  Leaderboard
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="text-gray-400 hover:text-funky-purple p-0 h-auto"
                  onClick={() => navigate('/profile')}
                >
                  Browse Influencers
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="text-gray-400 hover:text-funky-purple p-0 h-auto"
                  onClick={() => navigate('/wallet')}
                >
                  My Wallet
                </Button>
              </li>
            </ul>
          </div>

          {/* For Influencers */}
          <div>
            <h3 className="text-lg font-semibold font-display mb-4">For Influencers</h3>
            <ul className="space-y-2 font-body">
              <li>
                <Button 
                  variant="link" 
                  className="text-gray-400 hover:text-funky-purple p-0 h-auto"
                  onClick={() => navigate('/create-influencer-profile')}
                >
                  Join as Influencer
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="text-gray-400 hover:text-funky-purple p-0 h-auto"
                  onClick={() => navigate('/wishlist')}
                >
                  Manage Wishlist
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="text-gray-400 hover:text-funky-purple p-0 h-auto"
                  onClick={() => navigate('/gifts-sent')}
                >
                  Gift History
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="text-gray-400 hover:text-funky-purple p-0 h-auto"
                  onClick={() => navigate('/settings')}
                >
                  Settings
                </Button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold font-display mb-4">Support</h3>
            <ul className="space-y-2 font-body">
              <li>
                <Button variant="link" className="text-gray-400 hover:text-funky-purple p-0 h-auto">
                  Help Center
                </Button>
              </li>
              <li>
                <Button variant="link" className="text-gray-400 hover:text-funky-purple p-0 h-auto">
                  Contact Us
                </Button>
              </li>
              <li>
                <Button variant="link" className="text-gray-400 hover:text-funky-purple p-0 h-auto">
                  Privacy Policy
                </Button>
              </li>
              <li>
                <Button variant="link" className="text-gray-400 hover:text-funky-purple p-0 h-auto">
                  Terms of Service
                </Button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 font-body text-sm">
              © 2024 GiftFlow. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Made with</span>
              <Heart className="h-4 w-4 text-funky-pink fill-current" />
              <span className="text-gray-400 text-sm">for creators everywhere</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
