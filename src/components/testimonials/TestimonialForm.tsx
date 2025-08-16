import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquarePlus } from 'lucide-react';
import { useTestimonials } from '@/hooks/useTestimonials';

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().min(2, 'Role must be at least 2 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message must be less than 500 characters'),
  rating: z.number().min(1).max(5)
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

export const TestimonialForm = () => {
  const { submitTestimonial } = useTestimonials();
  const [open, setOpen] = React.useState(false);

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: '',
      role: '',
      message: '',
      rating: 5
    }
  });

  const onSubmit = async (data: TestimonialFormData) => {
    const success = await submitTestimonial({
      name: data.name,
      role: data.role,
      message: data.message,
      rating: data.rating
    });
    if (success) {
      form.reset();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Share Your Experience
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-funky-yellow" />
            Share Your Experience
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role/Profession</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Content Creator, Fan, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Rate your experience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: rating }, (_, i) => (
                              <Star key={i} className="h-4 w-4 text-funky-yellow fill-current" />
                            ))}
                            <span className="ml-2">{rating} Star{rating !== 1 ? 's' : ''}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Experience</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your experience with the platform..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};