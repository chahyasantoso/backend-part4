const _ = require("lodash");
const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const likesArr = blogs.map((blog) => blog.likes);
  return likesArr.reduce((sum, value) => sum + value, 0);
};

const favoriteBlog = (blogs) => {
  const likesArr = blogs.map((blog) => blog.likes);
  const mostLikes = Math.max(...likesArr);
  const blog = blogs.find((blog) => blog.likes === mostLikes);
  return blog
    ? {
        title: blog.title,
        author: blog.author,
        likes: blog.likes,
      }
    : null;
};

const mostBlogs = (blogs) => {
  //chain groupby and sumBy
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
