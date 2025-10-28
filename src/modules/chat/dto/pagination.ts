export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

export const createPaginatedResponse = <T>(
  data: T[],
  limit: number,
  nextCursor: string | null
): PaginatedResponse<T> => {
  return {
    data,
    pagination: {
      nextCursor,
      hasMore: nextCursor !== null,
      limit
    }
  };
};

