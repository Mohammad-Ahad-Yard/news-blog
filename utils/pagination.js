export const paginate = async (model, query = {}, reqQuery = {}, options = {}) => {
    const { page = 1, limit = 4, sort = "-createdAt" } = reqQuery;
    const paginationOptions = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        ...options
    };
    try {
        const results = await model.paginate(query, paginationOptions);
        return {
            data: results.docs,
            prevPage: results.prevPage,
            nextPage: results.nextPage,
            hasNextPage: results.hasNextPage,
            hasPrevPage: results.hasPrevPage,
            currentPage: results.page,
            counter: results.pagingCounter,
            limit: results.limit,
            totalDocs: results.totalDocs,
            totalPages: results.totalPages
        };
    } catch (error) {
        console.log("Pagination error:", error.message);
    }
};