import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Zap, Shield, Globe } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-[calc(100vh-64px)]">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white dark:bg-gray-900 pt-16 pb-32">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px] dark:bg-blue-900"></div>
                <div className="relative container mx-auto px-4 text-center z-10">
                    <div className="inline-flex items-center rounded-full border border-gray-200 bg-white/50 px-3 py-1 text-sm text-gray-600 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400 mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                        The #1 Job Platform for Remote Work
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                        Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">dream job</span> <br />
                        anywhere in the world.
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
                        Connect with top companies, find remote opportunities, and take your career to the next level with our dynamic job location matching.
                    </p>

                    <div className="flex items-center justify-center gap-x-6">
                        <Link
                            to="/jobs"
                            className="rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-all duration-200"
                        >
                            Explore Jobs
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm font-semibold leading-6 text-gray-900 dark:text-white flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Post a Job <span aria-hidden="true" className="ml-1">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            Why choose JobFlow?
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            We provide the tools you need to find the perfect match, whether you're hiring or looking for work.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="flex flex-col items-start bg-white dark:bg-gray-900/50 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 ring-1 ring-inset ring-blue-100 dark:ring-blue-900/50 mb-6">
                                <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-semibold leading-7 text-gray-900 dark:text-white mb-2">
                                Dynamic Location Matching
                            </h3>
                            <p className="flex-auto leading-7 text-gray-600 dark:text-gray-400">
                                Our smart algorithm matches you with jobs based on your preferred locations and time zones.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex flex-col items-start bg-white dark:bg-gray-900/50 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                            <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-3 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 mb-6">
                                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-semibold leading-7 text-gray-900 dark:text-white mb-2">
                                Real-time Updates
                            </h3>
                            <p className="flex-auto leading-7 text-gray-600 dark:text-gray-400">
                                Get instant notifications when new jobs matching your specific criteria are posted.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex flex-col items-start bg-white dark:bg-gray-900/50 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 ring-1 ring-inset ring-emerald-100 dark:ring-emerald-900/50 mb-6">
                                <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-semibold leading-7 text-gray-900 dark:text-white mb-2">
                                Verified Profiles
                            </h3>
                            <p className="flex-auto leading-7 text-gray-600 dark:text-gray-400">
                                Every job post and company profile is verified to ensure a safe and reliable job search.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-base leading-7 text-gray-600 dark:text-gray-400">Jobs Posted Daily</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">1,000+</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-base leading-7 text-gray-600 dark:text-gray-400">Active Companies</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">500+</dd>
                        </div>
                        <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                            <dt className="text-base leading-7 text-gray-600 dark:text-gray-400">Remote Workers</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">10k+</dd>
                        </div>
                    </dl>
                </div>
            </section>
        </div>
    );
};

export default Home;
