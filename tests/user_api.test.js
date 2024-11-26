const { test, after, beforeEach, describe } = require('node:test')
const assert = require("node:assert")
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')
const User = require('../models/user')
const bcrypt = require('bcryptjs')


describe('when there is initially one user in DB', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secretpassword', 10)
    const user = new User({ username: 'root', password: passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersBefore = await helper.usersInDB()

    const newUser = {
      username: 'chahya',
      password: 'password',
      name: 'Chahya Santoso',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await helper.usersInDB()
    assert.strictEqual(usersAfter.length, usersBefore.length + 1)

    const usernames = usersAfter.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fail on existing username', async () => {
    const usersBefore = await helper.usersInDB()
    const existingUsername = usersBefore[0].username

    const newUser = {
      username: existingUsername,
      password: 'password',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect(response => {
        assert(response.body.error.includes('username must be unique'))
      })
  })

  describe('creation fail on invalid payload', () => {
    test('username < 3', async () => {
      const newUser = {
        username: 'X',
        password: 'password',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect(response => {
          assert(response.body.error.includes('User validation failed'))
        })
    })

    test('password < 3', async () => {
      const newUser = {
        username: 'chahya',
        password: 'p',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect(response => {
          assert(response.body.error.includes('password must not be < 3'))
        })
    })

    test('no password given', async () => {
      const newUser = {
        username: 'chahya',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect(response => {
          assert(response.body.error.includes('password must not be < 3'))
        })
    })
  })

  
})

after(async () => {
  await mongoose.connection.close()
  process.exit()
})