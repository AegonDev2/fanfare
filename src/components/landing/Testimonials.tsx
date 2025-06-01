
import React from 'react';

const Testimonials = () => {
  return (
    <div className="testimonials-section py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <p className="italic mb-4">"Amazing platform to connect with my favorite creators!"</p>
            <p className="font-semibold">- Happy User</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <p className="italic mb-4">"Safe and secure way to send gifts."</p>
            <p className="font-semibold">- Satisfied Customer</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <p className="italic mb-4">"Love the experience and user interface!"</p>
            <p className="font-semibold">- Regular User</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
