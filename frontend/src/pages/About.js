import React from 'react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Caregivers', value: '500+' },
  { label: 'Care Seekers', value: '1000+' },
  { label: 'Cities', value: '25+' },
  { label: 'Successful Matches', value: '2000+' },
];

const team = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Co-Founder',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    bio: 'With over 15 years of experience in healthcare and technology, Sarah founded TogetherCare to revolutionize how we connect caregivers with those in need.',
  },
  {
    name: 'Michael Chen',
    role: 'CTO & Co-Founder',
    imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5',
    bio: 'A seasoned tech leader with a passion for creating meaningful social impact through innovative solutions.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Care Services',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    bio: 'Former healthcare administrator bringing expertise in quality care standards and caregiver training.',
  },
];

export default function About() {
  return (
    <div className="bg-white">
      {/* Mission section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-primary-100/20">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
            <h2 className="text-base font-semibold leading-8 text-primary-600">
              Our Mission
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Making quality care accessible to everyone
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              At TogetherCare, we believe that everyone deserves access to quality care.
              Our platform bridges the gap between qualified caregivers and those seeking
              care services, creating meaningful connections that enhance lives.
            </p>
          </div>
          <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 text-white sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-y-3 border-l border-primary-500/10 pl-6"
              >
                <dt className="text-sm leading-6 text-gray-600">{stat.label}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-primary-600">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Values section */}
      <div className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Our Values
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We're guided by our commitment to excellence, compassion, and innovation in
            everything we do.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:gap-x-16">
          {/* Trust and Safety */}
          <div className="relative pl-9">
            <dt className="inline font-semibold text-gray-900">
              <svg
                className="absolute left-1 top-1 h-5 w-5 text-primary-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21.324-.455.63-.739.914a.75.75 0 101.06 1.06c.37-.369.69-.77.96-1.193a26.61 26.61 0 013.095 2.348.75.75 0 00.992 0 26.547 26.547 0 015.93-3.95.75.75 0 00.42-.739 41.053 41.053 0 00-.39-3.114 29.925 29.925 0 00-5.199 2.801 2.25 2.25 0 01-2.514 0c-.41-.275-.826-.541-1.25-.797a6.985 6.985 0 01-1.084 3.45 26.503 26.503 0 00-1.281-.78A5.487 5.487 0 006 12v-.54z"
                  clipRule="evenodd"
                />
              </svg>
              Trust and Safety
            </dt>
            <dd className="inline">
              {' '}
              We prioritize the safety of our community through thorough background
              checks and verification processes.
            </dd>
          </div>

          {/* Quality Care */}
          <div className="relative pl-9">
            <dt className="inline font-semibold text-gray-900">
              <svg
                className="absolute left-1 top-1 h-5 w-5 text-primary-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M11.83 2.32a1 1 0 00-1.66 0l-3.5 5.25a1 1 0 001.66 1.11L10 6.06l1.67 2.62a1 1 0 001.66-1.11l-3.5-5.25zM10 9a1 1 0 100 2 1 1 0 000-2zm-3.5 3a1 1 0 112 0 1 1 0 01-2 0zm7 0a1 1 0 112 0 1 1 0 01-2 0z"
                  clipRule="evenodd"
                />
              </svg>
              Quality Care
            </dt>
            <dd className="inline">
              {' '}
              We maintain high standards for our caregivers and ensure they have the
              right qualifications and experience.
            </dd>
          </div>

          {/* Community */}
          <div className="relative pl-9">
            <dt className="inline font-semibold text-gray-900">
              <svg
                className="absolute left-1 top-1 h-5 w-5 text-primary-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
              </svg>
              Community
            </dt>
            <dd className="inline">
              {' '}
              We foster a supportive community where both caregivers and care seekers
              can thrive and build lasting relationships.
            </dd>
          </div>

          {/* Innovation */}
          <div className="relative pl-9">
            <dt className="inline font-semibold text-gray-900">
              <svg
                className="absolute left-1 top-1 h-5 w-5 text-primary-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M14.5 1A4.5 4.5 0 0010 5.5V9H3a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1.5V5.5a3 3 0 116 0v2.75a.75.75 0 001.5 0V5.5A4.5 4.5 0 0014.5 1z"
                  clipRule="evenodd"
                />
              </svg>
              Innovation
            </dt>
            <dd className="inline">
              {' '}
              We continuously improve our platform to make care coordination easier and
              more efficient for everyone.
            </dd>
          </div>
        </dl>
      </div>

      {/* Team section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Our Team
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Meet the passionate individuals behind TogetherCare who are dedicated to
            transforming the care industry.
          </p>
        </div>
        <ul
          className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
        >
          {team.map((person) => (
            <li key={person.name}>
              <img
                className="aspect-[3/2] w-full rounded-2xl object-cover"
                src={person.imageUrl}
                alt=""
              />
              <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-gray-900">
                {person.name}
              </h3>
              <p className="text-base leading-7 text-primary-600">{person.role}</p>
              <p className="mt-4 text-base leading-7 text-gray-600">{person.bio}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA section */}
      <div className="mx-auto mt-32 max-w-7xl sm:mt-40">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to join our community?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Whether you're looking to provide care or find care, we're here to help you
            make meaningful connections.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/register"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get started
            </Link>
            <Link to="/login" className="text-sm font-semibold leading-6 text-white">
              Sign in <span aria-hidden="true">→</span>
            </Link>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle
              cx={512}
              cy={512}
              r={512}
              fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
              fillOpacity="0.7"
            />
            <defs>
              <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                <stop stopColor="#3b82f6" />
                <stop offset={1} stopColor="#1d4ed8" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
