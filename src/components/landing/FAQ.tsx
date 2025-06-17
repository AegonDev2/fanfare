
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: "How does the gifting process work?",
      answer: "Simply browse influencer profiles, select a gift from their wishlist or our curated collection, add a personal message, and complete your purchase. The gift will be delivered directly to the influencer."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-leading security measures to protect your payment information. All transactions are encrypted and processed through secure payment gateways."
    },
    {
      question: "How do I climb the fan leaderboard?",
      answer: "You earn points by sending gifts to influencers. The more you gift, the higher you climb on the leaderboard. Points are awarded based on gift value and frequency."
    },
    {
      question: "Can influencers see who sent them gifts?",
      answer: "Yes, influencers can see who sent them gifts along with any personal messages you include. This helps build genuine connections between fans and creators."
    },
    {
      question: "What if an influencer doesn't receive my gift?",
      answer: "We provide tracking information for all gifts and have a dedicated support team to resolve any delivery issues. You can also track your gift status in your account."
    },
    {
      question: "How do I create an influencer profile?",
      answer: "You can apply to become an influencer through our platform. Once verified, you can set up your profile, create wishlists, and start receiving gifts from your fans."
    },
    {
      question: "Are there any fees for sending gifts?",
      answer: "We charge a small platform fee to maintain the service and ensure secure transactions. All fees are clearly displayed before you complete your purchase."
    },
    {
      question: "Can I return or cancel a gift?",
      answer: "Gifts can be cancelled within a short window after purchase if they haven't been processed yet. Due to the personal nature of gifts, returns are generally not available once delivered."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 bg-gradient-to-r from-funky-purple to-funky-pink bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
            Everything you need to know about our gifting platform
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-2 border-gray-100 rounded-lg px-6 data-[state=open]:border-funky-purple/20"
              >
                <AccordionTrigger className="text-left font-display font-semibold hover:text-funky-purple transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 font-body leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
