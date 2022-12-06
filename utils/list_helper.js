const totalLikes = (blogs) => {
  if (blogs.length === 0) return 0;
  if (blogs.length === 1) return blogs[0].likes;
  const reducer = (likes, blog) => likes + blog.likes;
  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return 0;
  let hasMostLikes = blogs[0];
  blogs.forEach((blog) => {
    if (blog.likes > hasMostLikes.likes) {
      hasMostLikes = blog;
    }
  });
  return {
    title: hasMostLikes.title,
    author: hasMostLikes.author,
    likes: hasMostLikes.likes,
  };
};

const getAuthorWithMost = (filter, blogs) => {
  if (blogs.length === 0) return 0;
  const allAuthors = []; // will contain all authors
  const authorsInfo = []; // array will contain all authors with data based on filter
  blogs.forEach((blog) => {
    const incrementAmount = filter === 'blogs' ? 1 : blog[filter];
    if (allAuthors.includes(blog.author)) {
      const authorInfo = authorsInfo.find((obj) => obj.author === blog.author);
      authorInfo[filter] += incrementAmount;
    } else {
      allAuthors.push(blog.author);
      authorsInfo.push({
        author: blog.author,
        [filter]: incrementAmount,
      });
    }
  });

  // Determining the authorsInfo object with highest amount of filter
  let authorWithMost = authorsInfo[0];
  authorsInfo.forEach((authorInfo) => {
    if (authorWithMost[filter] < authorInfo[filter]) {
      authorWithMost = authorInfo;
    }
  });
  return authorWithMost;
};

module.exports = {
  totalLikes,
  favoriteBlog,
  getAuthorWithMost,
};
