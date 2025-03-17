const paginate = async (model, query, page = 1, limit = 10, sort = {}) => {
    const skip = (page - 1) * limit;
    const totalCount = await model.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const data = await model.find(query)
        .sort(sort) // Apply sorting
        .skip(skip)
        .limit(limit)
        .exec();

    return {
        data,
        totalPages,
        currentPage: page,
        totalItems: totalCount,
        itemsPerPage: limit
    };
};

module.exports = { paginate };
