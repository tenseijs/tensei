import React from 'react'
import { PageWrapper, Heading } from '@tensei/components'
const Home: React.FC<{}> = () => {
    return (
        <PageWrapper>
            <div className="w-full flex justify-center">
                <div className="w-full max-w-5xl">
                    <Heading as="h1" className="text-2xl">
                        Get Started
                    </Heading>
                    <p className="mb-8">
                        Welcome to Tensei cms! These resources will help you get
                        up to speed fast.
                    </p>
                    <div className="mt-8 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <svg
                                        className="w-8 h-8 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        />
                                    </svg>
                                    <div className="ml-4 text-lg leading-7 font-semibold">
                                        <a
                                            href="https://tenseijs.com/docs"
                                            className=" text-tensei-gray-800 underline"
                                        >
                                            Documentation
                                        </a>
                                    </div>
                                </div>
                                <div className="ml-12">
                                    <div className="mt-2 text-sm">
                                        Tensei has a well thought out, practical
                                        documentation that covers every aspect
                                        of the framework. We recommend spending
                                        some time on the documentation so you
                                        become productive from day one.
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-tensei-gray-600 md:border-t-0 md:border-l">
                                <div className="flex items-center">
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                        className="w-8 h-8 text-gray-400"
                                    >
                                        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div className="ml-4 text-lg leading-7 font-semibold">
                                        <a
                                            href="https://tenseijs.com/docs/quickstart"
                                            className="text-tensei-gray-800 underline"
                                        >
                                            Quickstart
                                        </a>
                                    </div>
                                </div>
                                <div className="ml-12">
                                    <div className="mt-2 text-sm">
                                        First time using Tensei? Our quickstart
                                        guide will have you building
                                        applications in just a few minutes. We
                                        build a real API and cms for a SAAS in
                                        this guide in less than 10 minutes.
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-tensei-gray-600">
                                <div className="flex items-center">
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                        className="w-8 h-8 text-gray-400"
                                    >
                                        <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    <div className="ml-4 text-lg leading-7 font-semibold">
                                        <a
                                            href="https://twitter.com/tenseijs"
                                            className=" text-tensei-gray-800 underline"
                                        >
                                            Community
                                        </a>
                                    </div>
                                </div>
                                <div className="ml-12">
                                    <div className="mt-2 text-gray-600 text-sm">
                                        Want to get more involved and stay up to
                                        date with our community, progress,
                                        events and plans? Follow us on{' '}
                                        <a href="https://twitter.com/tenseijs">
                                            Twitter
                                        </a>
                                        . We love the community, and we'd love
                                        you to be part of it.
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-tensei-gray-600 md:border-l">
                                <div className="flex items-center">
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                        className="w-8 h-8 text-gray-400"
                                    >
                                        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="ml-4 text-lg leading-7 font-semibold text-tensei-gray-800">
                                        <a
                                            className="underline"
                                            href="https://github.com/tenseijs/tensei/discussions"
                                        >
                                            Help &amp; Support
                                        </a>
                                    </div>
                                </div>
                                <div className="ml-12">
                                    <div className="mt-2 text-gray-600 text-sm">
                                        Have any questions about Tensei? We
                                        offer timely support on our discussion
                                        forum. You can ask questions about
                                        anything that interests you. We'll be
                                        excited to hear from you.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    )
}

export default Home
