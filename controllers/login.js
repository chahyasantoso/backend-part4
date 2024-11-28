const router = require("express").Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

router.post("/", async (request, response) => {
  const {username, password} = request.body

  const user = await User.findOne({username})
  const passwordCorrect = user ? await bcrypt.compare(password, user.password) : false
  if (!passwordCorrect) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  // create token for user
  const result = {
    username: user.username,
    name: user.name,
    id: user._id
  }
  const token = jwt.sign(result, process.env.SECRET, { expiresIn: 60*60 })
  response.json({...result, token})
})

module.exports = router
