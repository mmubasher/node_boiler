'use strict';

const options = {
  query: {
    page: {
      name: 'page',  // The page parameter will now be called the_page
    },
    limit: {
      name: 'limit', // The limit will now be called per_page
      default: 10,
    },
  },
  meta: {
    location: 'body',
    name: 'metadata', // The meta object will be called metadata
    count: {
      active: true,
      name: 'count',
    },
    pageCount: {
      active: true,
      name: 'totalPages',
    },
    self: {
      active: false, // Will not generate the self link
    },
    previous: {
      active: false,
    },
    next: {
      active: false,
    },
    first: {
      active: false, // Will not generate the first link
    },
    last: {
      active: false, // Will not generate the last link
    },
    page: {
      active: true,
    },
    limit: {
      active: true,
    },
  },
  results: {
    name: 'data',
  },
  routes: {
    include: [
      '/api/users',
    ],
  },
};

module.exports.options = options;
