const { test, after, beforeEach } = require('node:test')
const assert = require("node:assert")
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')
const Blog = require('../models/blog')

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

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})
  
test('the first blog is about React patterns', async () => {
  const response = await api.get('/api/blogs')

  const contents = response.body.map(e => e.title)
  assert.strictEqual(contents.includes('React patterns'), true)
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
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDB()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const contents = blogsAtEnd.map(n => n.title)
  assert(contents.includes('new blog title'))
})

test('blog without content is not added', async () => {
  await api
    .post('/api/blogs')
    .send({})
    .expect(400)

  const blogsAtEnd = await helper.blogsInDB()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

})

after(async () => {
  await mongoose.connection.close()
})