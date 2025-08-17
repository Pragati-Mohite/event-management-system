import { Link } from 'react-router-dom';
import { CalendarIcon, TicketIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    name: 'Discover Events',
    description: 'Find amazing events happening around you. From concerts to conferences, discover what interests you.',
    icon: CalendarIcon,
  },
  {
    name: 'Easy Booking',
    description: 'Book tickets in just a few clicks. Secure payment processing and instant confirmation.',
    icon: TicketIcon,
  },
  {
    name: 'Organize Events',
    description: 'Create and manage your own events. Powerful tools for event organizers.',
    icon: UserGroupIcon,
  },
  {
    name: 'QR Code Entry',
    description: 'Digital tickets with QR codes for seamless event entry. No more paper tickets.',
    icon: SparklesIcon,
  },
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Discover Amazing Events Near You
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              EventHub is your premier destination for finding, booking, and managing events. 
              Whether you're looking to attend or organize, we've got you covered.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/events"
                className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Browse Events
              </Link>
              {!isAuthenticated ? (
                <Link 
                  to="/register" 
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Get Started <span aria-hidden="true">→</span>
                </Link>
              ) : user?.role === 'organizer' ? (
                <Link 
                  to="/organizer/create-event" 
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Create Event <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <Link 
                  to="/my-tickets" 
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  My Tickets <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              The complete event platform
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              From discovery to attendance, EventHub provides all the tools you need for a seamless event experience.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-primary-600 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Trusted by thousands of users
              </h2>
              <p className="mt-4 text-lg leading-8 text-primary-200">
                Join the growing community of event enthusiasts and organizers
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col bg-primary-700/10 p-8">
                <dt className="text-sm font-semibold leading-6 text-primary-200">Events Created</dt>
                <dd className="order-first text-3xl font-bold tracking-tight text-white">10,000+</dd>
              </div>
              <div className="flex flex-col bg-primary-700/10 p-8">
                <dt className="text-sm font-semibold leading-6 text-primary-200">Tickets Sold</dt>
                <dd className="order-first text-3xl font-bold tracking-tight text-white">500,000+</dd>
              </div>
              <div className="flex flex-col bg-primary-700/10 p-8">
                <dt className="text-sm font-semibold leading-6 text-primary-200">Happy Users</dt>
                <dd className="order-first text-3xl font-bold tracking-tight text-white">50,000+</dd>
              </div>
              <div className="flex flex-col bg-primary-700/10 p-8">
                <dt className="text-sm font-semibold leading-6 text-primary-200">Cities</dt>
                <dd className="order-first text-3xl font-bold tracking-tight text-white">100+</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gray-900 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
            <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Join EventHub today and discover amazing events or start organizing your own.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/register"
                      className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      Sign up now
                    </Link>
                    <Link to="/login" className="text-sm font-semibold leading-6 text-white">
                      Already have an account? <span aria-hidden="true">→</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/events"
                    className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Browse Events
                  </Link>
                )}
              </div>
            </div>
            <div className="relative mt-16 h-80 lg:mt-8">
              <img
                className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2830&q=80"
                alt="Event audience"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
