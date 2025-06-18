import React from 'react';

const mockReviews = [
  {
    id: 1,
    client: 'Sarah Johnson',
    rating: 5,
    date: '2024-03-15',
    comment:
      'Jane was absolutely wonderful with my mother. She was patient, caring, and professional. Highly recommend!',
    service: 'Elderly Care',
  },
  {
    id: 2,
    client: 'Michael Brown',
    rating: 4,
    date: '2024-03-10',
    comment:
      'Very good with special needs care. Shows great understanding and patience.',
    service: 'Special Needs Care',
  },
  {
    id: 3,
    client: 'Emily Davis',
    rating: 5,
    date: '2024-03-05',
    comment:
      'Excellent service! Very reliable and great with kids. Will definitely book again.',
    service: 'Child Care',
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center">
      {[0, 1, 2, 3, 4].map((star) => (
        <svg
          key={star}
          className={`h-5 w-5 ${
            star < rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
            clipRule="evenodd"
          />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  const averageRating =
    mockReviews.reduce((acc, review) => acc + review.rating, 0) /
    mockReviews.length;

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">My Reviews</h1>
            <div className="mt-2 flex items-center">
              <StarRating rating={Math.round(averageRating)} />
              <p className="ml-2 text-sm text-gray-700">
                {averageRating.toFixed(1)} out of 5 ({mockReviews.length} reviews)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <div className="min-w-full divide-y divide-gray-300">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="bg-white px-4 py-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {review.client}
                          </h3>
                          <p className="text-sm text-gray-500">{review.service}</p>
                        </div>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                      <div className="mt-2">
                        <StarRating rating={review.rating} />
                      </div>
                      <div className="mt-4 space-y-6 text-sm text-gray-600">
                        <p>{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 