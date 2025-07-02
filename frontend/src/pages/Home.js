import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { StarIcon } from '@heroicons/react/20/solid';
import { ShieldCheckIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-emerald-300 to-green-500 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <div className="flex">
              <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                <span className="font-semibold text-green-600">New</span>
                <span className="h-4 w-px bg-gray-900/10" aria-hidden="true" />
                <a href="#features" className="flex items-center gap-x-1">
                  See what's new
                  <span className="absolute inset-0" aria-hidden="true" />
                  →
                </a>
              </div>
            </div>
            <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Care that connects, support that matters
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join TogetherCare to find compassionate caregivers or provide meaningful care services. We make the connection simple, secure, and reliable.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="rounded-md bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="text-lg font-semibold leading-6 text-gray-900 hover:text-green-600"
                  >
                    Log in <span aria-hidden="true">→</span>
                  </Link>
                </>
              ) : (
                <Link
                  to={user.role === 'caregiver' ? '/caregiver/dashboard' : '/care-seeker/dashboard'}
                  className="rounded-md bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
            <div className="relative mx-auto w-[364px] max-w-full">
              <img
                className="absolute -top-64 left-1/2 -ml-[140px] w-[400px] max-w-none rounded-2xl bg-white/5 ring-1 ring-white/10"
                src="/hero-image.jpg"
                alt="Care in action"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div id="features" className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-green-600">Better Care Together</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for quality care
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our platform makes it easy to find or provide care services with confidence and peace of mind.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col items-start">
              <div className="rounded-lg bg-green-100 p-2 ring-1 ring-green-900/10">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <dt className="mt-4 font-semibold text-gray-900">Verified Caregivers</dt>
              <dd className="mt-2 leading-7 text-gray-600">
                Every caregiver undergoes thorough background checks and verification process to ensure your safety and peace of mind.
              </dd>
            </div>
            <div className="flex flex-col items-start">
              <div className="rounded-lg bg-green-100 p-2 ring-1 ring-green-900/10">
                <CalendarIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <dt className="mt-4 font-semibold text-gray-900">Flexible Scheduling</dt>
              <dd className="mt-2 leading-7 text-gray-600">
                Book care services when you need them, whether it's a one-time appointment or recurring care. Our platform makes scheduling simple.
              </dd>
            </div>
            <div className="flex flex-col items-start">
              <div className="rounded-lg bg-green-100 p-2 ring-1 ring-green-900/10">
                <UserGroupIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <dt className="mt-4 font-semibold text-gray-900">Perfect Matching</dt>
              <dd className="mt-2 leading-7 text-gray-600">
                Our smart matching system helps you find the ideal caregiver based on your specific needs, preferences, and schedule.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Testimonials section */}
      <div className="relative isolate mt-32 sm:mt-40 sm:pt-16">
        <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl">
          <div
            className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-emerald-300 to-green-500"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-green-600">Testimonials</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Loved by caregivers and care seekers
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-cols-3">
            <figure className="col-span-1 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5">
              <blockquote className="text-gray-900">
                <p>"TogetherCare made it incredibly easy to find a qualified caregiver for my mother. The platform is user-friendly and the caregivers are professional."</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-x-4">
                <img
                  className="h-10 w-10 rounded-full bg-gray-50"
                  src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=1024&h=1024&q=80"
                  alt=""
                />
                <div>
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-gray-600">Care Seeker</div>
                </div>
                <div className="ml-auto flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      className="h-5 w-5 text-yellow-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </figcaption>
            </figure>
            <figure className="col-span-1 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5">
              <blockquote className="text-gray-900">
                <p>"As a caregiver, this platform has helped me connect with families who need my services. The scheduling and payment system is seamless."</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-x-4">
                <img
                  className="h-10 w-10 rounded-full bg-gray-50"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
                <div>
                  <div className="font-semibold">Michael Brown</div>
                  <div className="text-gray-600">Caregiver</div>
                </div>
                <div className="ml-auto flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      className="h-5 w-5 text-yellow-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </figcaption>
            </figure>
            <figure className="col-span-1 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5">
              <blockquote className="text-gray-900">
                <p>"The verification process gave me confidence in choosing a caregiver. I've been using the service for months and couldn't be happier."</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-x-4">
                <img
                  className="h-10 w-10 rounded-full bg-gray-50"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
                <div>
                  <div className="font-semibold">Emily Davis</div>
                  <div className="text-gray-600">Care Seeker</div>
                </div>
                <div className="ml-auto flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      className="h-5 w-5 text-yellow-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="relative isolate mt-32 px-6 py-32 sm:mt-40 sm:py-40 lg:px-8">
        <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-emerald-300 to-green-500 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Join our community today and experience the difference that quality care can make.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/register"
              className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 