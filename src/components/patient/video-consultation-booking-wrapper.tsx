'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const VideoConsultationBooking = dynamic(
  () => import('./video-consultation-booking').then(mod => ({ default: mod.VideoConsultationBooking })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }
);

export { VideoConsultationBooking };
