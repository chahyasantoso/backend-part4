const { test, after, beforeEach, describe } = require('node:test')
const assert = require("node:assert")
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')
const Blog = require('../models/blog')
const { title } = require('node:process')

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogResults = helper.initialBlogs.map((blog) => {
    const blogObject = new Blog(blog)
    return blogObject.save()
  })
  await Promise.all(blogResults)
})

 
test('correct amount of blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blog has id property instead on _id', async () => {
  const response = await api.get('/api/blogs')

  assert('id' in response.body[0])
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

  const blog = blogsAtEnd.find(b => b.title === newBlog.title)
  assert(blog)
})

test('blog with missing likes defaults to 0 and can be added ', async () => {
  const newBlog = {
    title: "new blog title",
    author: "chahya santoso",
    url: "http://xxxx",
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDB()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const blog = blogsAtEnd.find(b => b.title === newBlog.title)
  assert.strictEqual(blog.likes, 0)
})

describe('server response status code is 400', () => {
  test('without title', async () => {
    const newBlog = {
      author: "chahya santoso",
      url: "http://xxxx",
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })

  test('without url', async () => {
    const newBlog = {
      title: "new blog title",
      author: "chahya santoso",
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })
})


test('delete blog with valid id', async () => {
  const blogsBefore = await helper.blogsInDB()
  const blogToDelete = blogsBefore[0]

  const deletedBlog = await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(200)

  const blogsAfter = await helper.blogsInDB()
  assert.strictEqual(blogsAfter.find((blog) => blog.id === deletedBlog.id), undefined)
  assert.strictEqual(blogsAfter.length, blogsBefore.length-1)
})

test('delete blog with invalid id', async () => {
  const validNonexistingId = await helper.nonExistingId()

  await api
    .delete(`/api/blogs/${validNonexistingId}`)
    .expect(404)
})

test('update blog with valid id', async () => {
  const blogsBefore = await helper.blogsInDB()
  const blogToUpdate = {...blogsBefore[0], likes: 100}

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(blogToUpdate)
    .expect(200)

  const blogsAfter = await helper.blogsInDB()
  const updatedBlog = blogsAfter.find((blog) => blog.id === blogToUpdate.id)
  assert.strictEqual(updatedBlog.likes, 100)
})




after(async () => {
  await mongoose.connection.close()
})