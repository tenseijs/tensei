import React from 'react'

export interface SearchInputProps {
    className?: string
    label?: string
    name?: string
}

const SearchInput: React.FC<SearchInputProps> = ({
    label = 'Search',
    name = 'search',
    className
}) => {
    return (
        <div className={className}>
            <label htmlFor={name} className="sr-only">
                {label}
            </label>
            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type="search"
                    placeholder="Search"
                    className="rounded-md block w-full pr-10 pl-3 py-2 leading-5 bg-white focus:outline-none placeholder-tensei-gray-700 focus:ring-1 focus:ring-tensei-primary border border-tensei-gray-600 focus:border-tensei-primary sm:text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default SearchInput
