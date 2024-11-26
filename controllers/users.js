const router = require("express").Router()
const { default: mongoose } = require("mongoose")
const User = require("../models/user")
const bcrypt = require("bcryptjs")

router.get("/", async (request, response) => {
  const users = await User.find({}).populate('blogs', {title: 1, author: 1, url: 1})
  response.json(users)
})

function validatePassword(password) {
  if (!password || password.length < 3) {
    return false
  }
  return true
}

router.post("/", async (request, response) => {
  const {username, password, name} = request.body

  if (!validatePassword(password)) {
    return response.status(400).json({ error: 'password must not be < 3' });
  }
  
  const salt = 10
  const passwordHash = await bcrypt.hash(password, salt)
  const user = new User({
    username,
    password: passwordHash,
    name
  })

  const result = await user.save()
  response.status(201).json(result)
})

// blogsRouter.put("/:id", async (request, response) => {
//   const id = request.params.id

//   const updatedBlog = new Blog({...request.body})
//   await updatedBlog.validate()

//   const result = await Blog.findOneAndUpdate(
//     {_id: id}, 
//     {...request.body}, 
//     {new: true, runValidators: true, context: 'query'}
//   )
//   if (!result) {
//     return response.status(404).end()
//   }
//   return response.json(result)
// })

// blogsRouter.delete("/:id", async (request, response) => {
//   const id = request.params.id

//   const result = await Blog.findByIdAndDelete(id)
//   if (!result) {
//     return response.status(404).end()
//   }
//   return response.json(result)
// })

module.exports = router