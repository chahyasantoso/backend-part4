const router = require("express").Router()
const Blog = require("../models/blog")
const User = require('../models/user')

router.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1})
  response.json(blogs)
})

router.post("/", async (request, response) => {
  const user = await User.findOne({})

  const blog = new Blog({...request.body, user: user._id})
  const result = await blog.save()

  user.blogs = [...user.blogs, result._id]
  await user.save()
  
  response.status(201).json(result)
})

router.put("/:id", async (request, response) => {
  const id = request.params.id

  const updatedBlog = new Blog({...request.body})
  await updatedBlog.validate()

  const result = await Blog.findOneAndUpdate(
    {_id: id}, 
    {...request.body}, 
    {new: true, runValidators: true, context: 'query'}
  )
  if (!result) {
    return response.status(404).end()
  }
  return response.json(result)
})

router.delete("/:id", async (request, response) => {
  const id = request.params.id

  const result = await Blog.findByIdAndDelete(id)
  if (!result) {
    return response.status(404).end()
  }
  return response.json(result)
})

module.exports = router
