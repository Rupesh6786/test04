
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, Image as ImageIcon } from 'lucide-react';
import type { MediaItem } from '@/types';

const mediaItems: MediaItem[] = [
  {
    id: '1',
    type: 'video',
    src: 'https://www.youtube.com/embed/bgo1nBq213I',
    thumbnail: 'https://placehold.co/600x400.png',
    title: 'AC Installation Demo',
    description: 'Watch our experts install an AC unit efficiently.',
    aiHint: 'ac installation video',
  },
  {
    id: '2',
    type: 'image',
    src: 'https://placehold.co/600x400.png',
    title: 'Happy Customer Testimonial',
    description: 'A satisfied customer with their newly serviced AC.',
    aiHint: 'happy customer air conditioner',
  },
  {
    id: '3',
    type: 'video',
    src: 'https://www.youtube.com/embed/r_2n4T2f-i4',
    thumbnail: 'https://placehold.co/600x400.png',
    title: 'AC Filter Cleaning Tutorial',
    description: 'Learn how to clean your AC filters for better performance.',
    aiHint: 'technician ac repair',
  },
  {
    id: '4',
    type: 'image',
    src: 'https://placehold.co/600x400.png',
    title: 'Our Range of Used ACs',
    description: 'A Glimpse of our quality-checked second-hand AC units.',
    aiHint: 'air conditioner showroom',
  },
  {
    id: '5',
    type: 'image',
    src: 'https://placehold.co/600x400.png',
    title: 'Expert Technician at Work',
    description: 'Our certified technician diagnosing an AC issue.',
    aiHint: 'ac technician service',
  },
  {
    id: '6',
    type: 'video',
    src: 'https://www.youtube.com/embed/I-D3_r5E4bI',
    thumbnail: 'https://placehold.co/600x400.png',
    title: 'Why Choose Classic-Solution?',
    description: 'Hear from our founder about our commitment to quality.',
    aiHint: 'company presentation',
  },
];

export default function MediaPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Media Gallery</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore AC demo videos, service tutorials, and customer testimonials.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          (Note: User posting and voting features are planned for a future update.)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {mediaItems.map((item) => (
          <Card key={item.id} className="overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-0">
              <div className="relative aspect-video">
                {item.type === 'video' ? (
                  <>
                    <Image
                      src={item.thumbnail || 'https://placehold.co/600x400.png'} // Fallback thumbnail
                      alt={item.title}
                      data-ai-hint={item.aiHint}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <a 
                      href={item.src.startsWith('https://www.youtube.com/embed/') ? item.src : `https://www.youtube.com/watch?v=${item.src}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors"
                      aria-label={`Watch video: ${item.title}`}
                    >
                      <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white transition-colors" />
                    </a>
                  </>
                ) : (
                  <Image
                    src={item.src}
                    alt={item.title}
                    data-ai-hint={item.aiHint}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-headline text-lg font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">{item.title}</h3>
                {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
