const router = require('express').Router()
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const middleware = require('../utils/middleware')

router.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

router.post('/', middleware.userExtractor, async (request, response) => {
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const blog = new Blog({ ...request.body, user: user._id })
  const savedBlog = await blog.save()
  await savedBlog.populate('user', { username: 1, name: 1 })

  user.blogs = [...user.blogs, savedBlog._id]
  await user.save()

  response.status(201).json(savedBlog)
})

router.put('/:id', async (request, response) => {
  const updatedBlog = new Blog({ ...request.body })
  await updatedBlog.validate()

  const result = await Blog.findByIdAndUpdate(
    request.params.id,
    { ...request.body },
    { new: true, runValidators: true, context: 'query' }
  ).populate('user', { username: 1, name: 1 })

  if (!result) {
    return response.status(404).end()
  }

  console.log(result)
  response.json(result)
})

router.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const blog = await Blog.findById(request.params.id)
  const userMatch =
    user && blog ? user._id.toString() === blog.user.toString() : false
  if (!userMatch) {
    if (!blog) {
      return response.status(404).end()
    }
    return response.status(403).json({ error: 'delete forbidden' })
  }

  user.blogs = user.blogs.filter(
    (blogId) => blogId.toString() !== blog._id.toString()
  )
  await user.save()
  //doesn't need populate, i don't think it's in use

  await blog.deleteOne()
  return response.json(blog)
})

module.exports = router
