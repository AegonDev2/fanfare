
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FAQ() {
  const faqs = [
    {
      question: "How does the gift delivery work?",
      answer: "We coordinate with the influencer to ensure gifts are delivered to their preferred address. All deliveries are tracked and secure."
    },
    {
      question: "Can I include a personal message?",
      answer: "Yes! You can add a personal message with your gift that will be shared with the influencer."
    },
    {
      question: "What if the influencer doesn't receive my gift?",
      answer: "We have a 100% delivery guarantee. If there are any issues with delivery, we'll work to resolve them or provide a full refund."
    },
    {
      question: "Are there any fees?",
      answer: "We charge a small platform fee to maintain our service and ensure secure transactions. All fees are clearly displayed before checkout."
    },
    {
      question: "How do I track my gift?",
      answer: "You'll receive tracking information once your gift ships, and you can monitor its progress in your account dashboard."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
