const blogsRouter = require("express").Router()
const Blog = require("../models/blog")

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post("/", async (request, response) => {
  const blog = new Blog(request.body)
  const result = await blog.save()
  response.status(201).json(result)
})

blogsRouter.put("/:id", async (request, response) => {
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

blogsRouter.delete("/:id", async (request, response) => {
  const id = request.params.id

  const result = await Blog.findByIdAndDelete(id)
  if (!result) {
    return response.status(404).end()
  }
  return response.json(result)
})

module.exports = blogsRouter
