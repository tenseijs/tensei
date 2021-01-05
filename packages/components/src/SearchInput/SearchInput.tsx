import React from 'react'
import { ChangeEventHandler } from 'react'

export interface SearchInputProps {
    className?: string
    label?: string
    name?: string
    value?: string
    onChange?: ChangeEventHandler<HTMLInputElement>
}

const SearchInput: React.FC<SearchInputProps> = ({
    label = 'Search',
    name = 'search',
    value,
    className,
    onChange
}) => {
    return (
        <div className={className}>
            <label htmlFor={name} className="sr-only">
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        aria-labelledby="search"
                        role="presentation"
                        className="fill-current search-icon-center text-gray-400"
                    >
                        <path
                            fillRule="nonzero"
                            d="M14.32 12.906l5.387 5.387a1 1 0 0 1-1.414 1.414l-5.387-5.387a8 8 0 1 1 1.414-1.414zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"
                        />
                    </svg>
                </div>
                <input
                    id={name}
                    name={name}
                    value={value}
                    type="search"
                    onChange={onChange}
                    placeholder="Search"
                    className="rounded-full block w-full pl-14 pr-8 h-10 leading-5 bg-white focus:outline-none placeholder-tensei-gray-700 focus:ring-1 focus:ring-tensei-primary border border-tensei-gray-600 focus:border-tensei-primary"
                />
            </div>
        </div>
    )
}

export default SearchInput
