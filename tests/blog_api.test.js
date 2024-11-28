const { test, after, beforeEach, describe, before } = require('node:test')
const assert = require("node:assert")
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogResults = helper.initialBlogs.map((blog) => {
    const blogObject = new Blog(blog)
    return blogObject.save()
  })
  await Promise.all(blogResults)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are 6 blogs', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})
  
test('the first blog is about React patterns', async () => {
  const response = await api.get('/api/blogs')
  const contents = response.body.map(b => b.title)
  assert.strictEqual(contents.includes('React patterns'), true)
})

describe('when user is not authenticated', () => {
  test('adding a valid blog fails with 401 unauthorized', async () => {
    const newBlog = {
      title: "new blog title",
      author: "chahya santoso",
      url: "http://xxxx",
      likes: 10,
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})

describe('when user is authenticated', () => {
  let token = ''
  before(async () => {
    await User.deleteMany({})

    const rootUser = {
      username: 'root',
      password: 'secretpassword'
    }

    const passwordHash = await bcrypt.hash(rootUser.password, 10)
    const user = new User({...rootUser, password: passwordHash})
    await user.save()

    const response = await api
      .post('/api/login')
      .send(rootUser)

    token = response.body.token
  })

  test('a valid blog can be added ', async () => {
    const newBlog = {
      title: "new blog title",
      author: "chahya santoso",
      url: "http://xxxx",
      likes: 10,
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAfter = await helper.blogsInDB()
    assert.strictEqual(blogsAfter.length, helper.initialBlogs.length + 1)
  
    const contents = blogsAfter.map(b => b.title)
    assert(contents.includes('new blog title'))
  })

  test('blog without content is not added', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDB()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})


after(async () => {
  await mongoose.connection.close()
  process.exit()
})