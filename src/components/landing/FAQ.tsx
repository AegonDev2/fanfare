
import React from 'react';

const FAQ = () => {
  return (
    <div className="faq-section py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">How does the platform work?</h3>
            <p>Simply choose an influencer, select a gift, and send it with a personal message.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Is it safe to use?</h3>
            <p>Yes, all transactions are secure and influencer addresses are verified.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">How long does delivery take?</h3>
            <p>Delivery times vary by location, typically 3-7 business days.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
