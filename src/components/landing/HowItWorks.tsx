
import React from 'react';

const HowItWorks = () => {
  return (
    <div className="how-it-works-section py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Step 1</h3>
            <p>Choose your favorite influencer</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Step 2</h3>
            <p>Select a gift from their wishlist</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Step 3</h3>
            <p>Send with a personal message</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
