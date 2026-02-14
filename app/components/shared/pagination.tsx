import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Button } from "../ui/button";

const PagePagination = ({ totalPages, currentPage, handlePageChange }) => {
  const getPageRange = () => {
    let start = Math.max(currentPage - 1, 1);
    let end = Math.min(currentPage + 1, totalPages);

    if (currentPage === 1) {
      end = Math.min(start + 2, totalPages);
    }
    if (currentPage === totalPages) {
      start = Math.max(end - 2, 1);
    }

    const range = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  const pageRange = getPageRange();

  return (
    <div className="my-5 px-2">
      <Pagination className="flex items-center justify-between">
        <Button
          className={`h-10 md:h-10`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          //   isActive={currentPage === 1}
          variant="outline"
        >
          Previous
        </Button>
        <PaginationContent>
          {pageRange[0] > 1 && (
            <>
              <PaginationItem>
                <PaginationLink
                  className="cursor-pointer"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {pageRange[0] > 2 && <PaginationEllipsis>...</PaginationEllipsis>}
            </>
          )}
          {pageRange.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={currentPage === page}
                className="cursor-pointer"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          {pageRange[pageRange.length - 1] < totalPages && (
            <>
              {pageRange[pageRange.length - 1] < totalPages - 1 && (
                <PaginationEllipsis>...</PaginationEllipsis>
              )}
              <PaginationItem>
                <PaginationLink
                  className="cursor-pointer"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
        </PaginationContent>
        <Button
          className={`h-10 md:h-10`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Next
        </Button>
      </Pagination>
    </div>
  );
};

export default PagePagination;
