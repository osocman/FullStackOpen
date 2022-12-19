const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

// before each test the database is set to have the same data to make testing
// predictable and reliable
beforeEach(async () => {
  await Blog.deleteMany({});
  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blogObject) => blogObject.save());
  await Promise.all(promiseArray);
});

const specificBlog = helper.initialBlogs[2];
specificBlog.id = specificBlog._id;

describe('blogList api:', () => {
  describe('when GETTING all blogs', () => {
    test('blogs are returned in JSON format', async () => {
      const response = await api
        .get('/api/blogs')
        .expect('Content-Type', /application\/json/);
    }, 10000);

    test('all blogs are returned', async () => {
      const { body } = await api.get('/api/blogs');
      expect(body).toHaveLength(4);
    });

    test('a specific blog is within the returned blogs', async () => {
      const { body } = await api.get('/api/blogs');
      const blogTitles = body.map((blog) => blog.title);
      expect(blogTitles).toContain('The Third King');
    });

    test("all blogs have property '.id' that is not undefined", async () => {
      const response = await api
        .get('/api/blogs');
      const blogs = response.body;
      const blogIds = blogs.map((blog) => blog.id);
      for (let i = 0; i < blogIds.length; i += 1) {
        expect(blogIds[i]).toBeDefined();
      }
    }, 10000);
  });

  describe('when GETTING a single blog', () => {
    test("succeeds with status 200 if 'id' is valid", async () => {
      const blogsInDatabase = await helper.blogsInDb();
      const blogToGet = blogsInDatabase[2];

      const response = await api
        .get(`/api/blogs/${blogToGet.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body).toEqual(blogToGet);
    });

    test('fails with status 400 if id is malformatted', async () => {
      const invalidId = 'df423842dsjf34';
      await api
        .get(`/api/blogs/${invalidId}`)
        .expect(400);
    });

    test('fails status 404 when id does not exist', async () => {
      const nonExistingId = await helper.nonExistingId();
      await api
        .get(`/api/blogs/${nonExistingId}`)
        .expect(404);
    });
  });

  describe('when POSTING a blog', () => {
    test('blogList length is increased by one', async () => {
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

    test("without property 'likes' defaults to 0 likes", async () => {
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

    test("without property 'title' or 'url' results in status 400", async () => {
      await api
        .post('/api/blogs')
        .send({
          author: 'John Brown',
          likes: 69,
        })
        .expect(400);
    }, 10000);
  });

  describe('when UPDATING a blog', () => {
    test('succeeds with status 200 when request has necessary info', async () => {
      // const blogToUpdate = helper.initialBlogs[2];
      const { id } = helper.initialBlogs[2];
      const { body: blogToUpdate } = await api.get(`/api/blogs/${id}`);

      blogToUpdate.likes = 320;
      blogToUpdate.author = 'John Brown';

      const response = await api
        .put(`/api/blogs/${id}`)
        .set('Content-Type', 'application/json')
        .send(blogToUpdate)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body).toEqual({
        id: '638f3198efe09a3cbedaca5d',
        title: 'The Third King',
        author: 'John Brown',
        url: 'www.Jackson.io',
        likes: 320,
      });
    });
  });

  describe('when DELETING a blog by id', () => {
    test('succeeds with status 204 if id is valid', async () => {
      await api
        .delete(`/api/blogs/${specificBlog.id}`)
        .expect(204);

      const response = await api.get('/api/blogs');
      const blogIds = response.body.map((blog) => blog.id);

      expect(response.body).toHaveLength(helper.initialBlogs.length - 1);
      expect(blogIds).not.toContain(specificBlog.id);
    });

    test('fails with status 404 if id is not in database', async () => {
      const nonExistingId = await helper.nonExistingId();
      await api
        .delete(`/api/blogs/${nonExistingId}`)
        .expect(404);
    });

    test('fails with status 400 if id is malformatted', async () => {
      const invalidId = 'df423842dsjf34';
      await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(400);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
