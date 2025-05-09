
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Gift } from 'lucide-react';

interface GiftMessageProps {
  onChange: (message: string) => void;
  defaultValue?: string;
}

export default function GiftMessage({ onChange, defaultValue = '' }: GiftMessageProps) {
  const [message, setMessage] = useState(defaultValue);
  
  useEffect(() => {
    if (defaultValue !== message) {
      setMessage(defaultValue);
    }
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    onChange(newMessage);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-funky-purple" />
        <h3 className="font-medium">Add a Personal Message</h3>
      </div>
      
      <Textarea
        placeholder="Write a personal message to go with your gift..."
        value={message}
        onChange={handleChange}
        className="min-h-[100px] border-funky-purple/20 focus:border-funky-purple"
      />
      
      <p className="text-xs text-gray-500">
        Your message will be included with the gift when it's sent to the influencer.
      </p>
    </div>
  );
}
