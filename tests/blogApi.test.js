const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blogObject) => blogObject.save());
  await Promise.all(promiseArray);
});

describe('testing blogList api', () => {
  test('all notes are returned and are returned in JSON', async () => {
    const response = await api
      .get('/api/blogs')
      .expect('Content-Type', /application\/json/);
    expect(response.body).toHaveLength(4);
  }, 10000);
});

afterAll(() => {
  mongoose.connection.close();
});
