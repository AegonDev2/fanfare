
import React from 'react';

const WhyUs = () => {
  return (
    <div className="why-us-section py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Secure</h3>
            <p>Your transactions are safe and secure</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Fast</h3>
            <p>Quick delivery to your favorite influencers</p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Trusted</h3>
            <p>Verified influencers and authentic connections</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyUs;
