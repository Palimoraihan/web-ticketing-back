const ticketParseQueryParams = (req, res, next) => {
  // Default values
  const defaults = {
    page: 1,
    limit: 10,
    sort: "createdAt",
    order: "desc",
    search: "",
  };

  // Parse dan validate limit
  let limit = parseInt(req.query.limit) || defaults.limit;
  limit = Math.min(Math.max(limit, 1), 100); // Batasi antara 1-100

  // Parse dan validate page
  let page = parseInt(req.query.page) || defaults.page;
  page = Math.max(page, 1); // Minimal page 1

  // Parse dan validate sort order
  const order =
    req.query.order && ["asc", "desc"].includes(req.query.order.toLowerCase())
      ? req.query.order.toLowerCase()
      : defaults.order;

  // Parse sort field
  const sort = req.query.sort || defaults.sort;

  // Parse search term
  const search = req.query.search ? req.query.search.trim() : defaults.search;

  // Calculate offset untuk pagination
  const offset = (page - 1) * limit;

  let category = parseInt(req.query.category);
  category = Math.max(category, 1);
  let priority = parseInt(req.query.priority);
  priority = Math.max(priority, 1);
  let status = parseInt(req.query.status);
  status = Math.max(status, 1);

  // Attach parsed params ke request object
  
  req.queryParams = {
    limit,
    offset,
    page,
    sort,
    order,
    search,
    category,
    priority,
    status,
  };

  next();
};
module.exports = { ticketParseQueryParams };
