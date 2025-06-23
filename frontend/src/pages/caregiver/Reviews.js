import React from 'react';

const mockReviews = [
  {
    id: 1,
    client: 'Amina Ali',
    rating: 5,
    date: '2025-06-20', // Updated date
    comment:
      'Mercy was a true blessing for my elderly mother. So patient, kind, and always on time. Highly recommend her for anyone needing reliable care in Nairobi!',
    service: 'Elderly Care',
    careSeekerImage: 'https://randomuser.me/api/portraits/women/68.jpg', // Placeholder image
  },
  {
    id: 2,
    client: 'David Mwaura',
    rating: 4,
    date: '2025-06-15', // Updated date
    comment:
      'The caregiver provided was very understanding and gentle with my child who has special needs. Their approach was very helpful and professional.',
    service: 'Special Needs Care',
    careSeekerImage: 'https://randomuser.me/api/portraits/men/33.jpg', // Placeholder image
  },
  {
    id: 3,
    client: 'Grace Wanjiku',
    rating: 5,
    date: '2025-06-10', // Updated date
    comment:
      'Fantastic experience with the childcare service! Jane kept the kids engaged and safe. Truly reliable, will definitely use "Together Care" again.',
    service: 'Child Care',
    careSeekerImage: 'https://randomuser.me/api/portraits/women/45.jpg', // Placeholder image
  },
  {
    id: 4,
    client: 'Robert Kipchoge',
    rating: 4, // Adjusted rating
    date: '2025-06-05', // Updated date
    comment:
      'Impressed by the professionalism. My recovery process was made much smoother thanks to their attentive post-operative care.',
    service: 'Post-operative Care',
    careSeekerImage: 'https://randomuser.me/api/portraits/men/88.jpg', // Placeholder image
  },
  {
    id: 5,
    client: 'Fatuma Hassan',
    rating: 3, // Adjusted rating
    date: '2025-05-30', // Updated date
    comment:
      'Good companion care for my grandmother. She enjoys the conversations and activities. There was a minor scheduling mix-up but it was quickly resolved.',
    service: 'Companion Care',
    careSeekerImage: 'https://randomuser.me/api/portraits/women/22.jpg', // Placeholder image
  },
  {
    id: 6,
    client: 'James Omondi',
    rating: 4, // Adjusted rating
    date: '2025-05-25', // Updated date
    comment:
      'The physiotherapist was very skilled and helped me regain mobility. Very happy with the sessions.',
    service: 'Physiotherapy Support',
    careSeekerImage: 'https://randomuser.me/api/portraits/men/12.jpg', // Placeholder image
  },
  {
    id: 7,
    client: 'Njeri Kamau',
    rating: 5,
    date: '2025-06-22', // New review, recent date
    comment:
      'Excellent home nursing care. The nurse was very gentle and explained everything clearly. Made me feel very comfortable.',
    service: 'Home Nursing',
    careSeekerImage: 'https://randomuser.me/api/portraits/women/70.jpg', // New placeholder
  },
  {
    id: 8,
    client: 'Samuel Kimani',
    rating: 5,
    date: '2025-06-19', // New review, recent date
    comment:
      'The caregiver for my son with autism was exceptional. Very patient, resourceful, and understanding. Truly a blessing!',
    service: 'Autism Support',
    careSeekerImage: 'https://randomuser.me/api/portraits/men/50.jpg', // New placeholder
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
            <h1 className="text-2xl font-semibold text-gray-900">Customer Reviews</h1>
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
                <div className="divide-y divide-gray-300">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="bg-white px-4 py-6">
                      <div className="flex items-start justify-between"> {/* Changed items-center to items-start for image alignment */}
                        <div className="flex items-center"> {/* New div for image and text content */}
                            <img
                                src={review.careSeekerImage}
                                alt={review.client}
                                className="h-12 w-12 rounded-full mr-4 object-cover" // Styling for image
                            />
                            <div>
                                <h3 className="text-md font-semibold text-gray-900">
                                    {review.client}
                                </h3>
                                <p className="text-sm text-gray-500">{review.service}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 text-right">{review.date}</p> {/* Moved date to the right */}
                      </div>
                      <div className="mt-2">
                        <StarRating rating={review.rating} />
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        <p className="leading-relaxed">{review.comment}</p>
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