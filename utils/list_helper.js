const _ = require("lodash")
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const likesArr = blogs.map((blog) => blog.likes)
  return likesArr.reduce((sum, value) => sum + value, 0)
}

const favoriteBlog = (blogs) => {
  /*
  const likesArr = blogs.map((blog) => blog.likes)
  const mostLikes = Math.max(...likesArr)
  const result = blogs.find((blog) => blog.likes === mostLikes)
  return result
    ? {
        title: result.title,
        author: result.author,
        likes: result.likes,
      }
    : null
  */
  return _(blogs)
    .map(({title, author, likes}) => ({
      title,
      author,
      likes
    }))
    .maxBy("likes")
}

const mostBlogs = (blogs) => {
  return _(blogs)
    .groupBy("author")
    .map((v, k) => ({
      author: k,
      blogs: v.length
    }))
    .maxBy("blogs")
}

const mostLikes = (blogs) => {
  return _(blogs)
    .groupBy("author")
    .map((v, k) => ({
      author: k,
      likes: _.sumBy(v, "likes")
    }))
    .maxBy("likes")
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
