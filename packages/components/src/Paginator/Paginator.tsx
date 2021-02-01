import React from 'react'
import Paginate, { ReactPaginateProps } from 'react-paginate'

export interface PaginatorProps {
    page: number
    page_count: number
    onPageChange: ReactPaginateProps['onPageChange']
}

const Paginator: React.FC<PaginatorProps> = ({
    page,
    page_count,
    onPageChange
}) => {
    return (
        <Paginate
            forcePage={page}
            previousLabel={
                <button className="mr-2 p-3 focus:outline-none focus:ring-2 border border-transparent focus:ring-tensei-primary rounded-lg">
                    <svg
                        className="fill-current"
                        width={10}
                        height={10}
                        viewBox="0 0 6 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M6 1.2833L2.2915 4.9999L6 8.7165L4.8583 9.8582L-2.12363e-07 4.9999L4.8583 0.141602L6 1.2833Z" />
                    </svg>
                </button>
            }
            nextLabel={
                <button className="ml-2 p-3 focus:outline-none focus:ring-2 border border-transparent focus:ring-tensei-primary rounded-lg">
                    <svg
                        className="fill-current transform rotate-180"
                        width={10}
                        height={10}
                        viewBox="0 0 6 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M6 1.2833L2.2915 4.9999L6 8.7165L4.8583 9.8582L-2.12363e-07 4.9999L4.8583 0.141602L6 1.2833Z" />
                    </svg>
                </button>
            }
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={page_count}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={onPageChange}
            pageLinkClassName={
                'cursor-pointer px-3 py-1 bg-transparent mr-2 rounded-lg focus:outline-none focus:ring-2 border border-transparent focus:ring-tensei-primary'
            }
            containerClassName={
                'flex items-center justify-center w-full md:w-auto'
            }
            activeLinkClassName={
                'rounded-lg px-3 text-white py-1 mr-2 font-semibold bg-tensei-primary'
            }
        />
    )
}

export default Paginator
