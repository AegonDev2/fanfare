
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FAQ() {
  const faqs = [
    {
      question: "How does gift delivery work?",
      answer: "We coordinate with influencers to ensure secure and timely delivery of your gifts."
    },
    {
      question: "Can I include a personal message?",
      answer: "Yes! You can add a personal message with every gift you send."
    },
    {
      question: "Is my payment secure?",
      answer: "Absolutely. We use industry-standard encryption to protect all transactions."
    },
    {
      question: "Can I track my gift order?",
      answer: "Yes, you'll receive updates on your gift's status from order to delivery."
    }
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
