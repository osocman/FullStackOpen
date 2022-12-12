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
  test('all blogs are returned (in JSON format)', async () => {
    const response = await api
      .get('/api/blogs')
      .expect('Content-Type', /application\/json/);
    expect(response.body).toHaveLength(4);
  }, 10000);

  test('all blogs have an id property that is not undefined', async () => {
    const response = await api
      .get('/api/blogs');
    const blogs = response.body;
    const blogIds = blogs.map((blog) => blog.id);
    for (let i = 0; i < blogIds.length; i += 1) {
      expect(blogIds[i]).toBeDefined();
    }
  }, 10000);

  test('posting a blog increases blogList length by one', async () => {
    await api
      .post('/api/blogs')
      .send({
        title: 'This note is only used for testing',
        author: 'The testing guy',
        url: 'www.doubleTest.net',
        likes: 21,
      })
      .expect(201);

    const response = await api
      .get('/api/blogs')
      .expect('Content-Type', /application\/json/);

    const blogTitles = response.body.map((blog) => blog.title);

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1);
    expect(blogTitles).toContain('This note is only used for testing');
  }, 10000);

  test('posting a blog without likes property defaults to 0 likes', async () => {
    const response = await api
      .post('/api/blogs')
      .send({
        title: 'This note does not have a likes property',
        author: 'The testing guy',
        url: 'www.doubleTest.net',
      })
      .expect(201);
    const { likes } = response.body;
    expect(likes).toBe('0');
  }, 10000);

  test('posting a blog without title or url property results in a 400 status code', async () => {
    await api
      .post('/api/blogs')
      .send({
        author: 'John Brown',
        likes: 69,
      })
      .expect(400);
  }, 10000);
});

afterAll(() => {
  mongoose.connection.close();
});
