const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const helper = require('./test_helper');

const api = supertest(app);

// ! Working on 4.23
// Many tests are broken down after authentication feature was added.

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  await helper.generateInitialData();
});

// const specificBlog = helper.initialBlogs[2];
// specificBlog.id = specificBlog._id;

describe('blog api:', () => {
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
      const { singleBlogInDb } = await helper.getBlogsFromDb();

      const response = await api
        .get(`/api/blogs/${singleBlogInDb.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.title).toBe(singleBlogInDb.title);
    });

    test('fails with status 400 if id is malformatted', async () => {
      const invalidId = 'df423842dsjf34';
      await api
        .get(`/api/blogs/${invalidId}`)
        .expect(400);
    });

    test('fails status 404 when id does not exist', async () => {
      const nonExistingId = await helper.getNonExistingId();
      await api
        .get(`/api/blogs/${nonExistingId}`)
        .expect(404);
    });
  });

  describe('when POSTING a blog', () => {
    test('blogList length is increased by one', async () => {
      const { singleUserInDb, tokenHeader } = await helper.getUsersFromDb();
      const { allBlogsInDb } = await helper.getBlogsFromDb();
      await api
        .post('/api/blogs')
        .set('Authorization', tokenHeader)
        .send({
          title: 'This note is only used for testing',
          author: 'The testing guy',
          url: 'www.doubleTest.net',
          likes: 21,
          user: singleUserInDb.id,
        })
        .expect(201);

      const response = await api
        .get('/api/blogs')
        .expect('Content-Type', /application\/json/);

      const blogTitles = response.body.map((blog) => blog.title);

      expect(response.body).toHaveLength(allBlogsInDb.length + 1);
      expect(blogTitles).toContain('This note is only used for testing');
    }, 10000);

    test("without property 'likes' defaults to 0 likes", async () => {
      const { singleUserInDb, tokenHeader } = await helper.getUsersFromDb();
      const response = await api
        .post('/api/blogs')
        .set('Authorization', tokenHeader)
        .send({
          title: 'This note does not have a likes property',
          author: 'The testing guy',
          url: 'www.doubleTest.net',
          user: singleUserInDb.id,
        })
        .expect(201);
      const { likes } = response.body;
      expect(likes).toBe('0');
    }, 10000);

    test("without property 'title' or 'url' results in status 400", async () => {
      const { singleUserInDb, tokenHeader } = await helper.getUsersFromDb();
      await api
        .post('/api/blogs')
        .set('Authorization', tokenHeader)
        .send({
          author: 'John Brown',
          likes: 69,
          user: singleUserInDb.id,
        })
        .expect(400);
    }, 10000);

    test('fails with status 401 when if no token is provied', async () => {
      const { singleUserInDb } = await helper.getUsersFromDb();
      await api
        .post('/api/blogs')
        .send({
          author: 'John Brown',
          likes: 69,
          user: singleUserInDb.id,
        })
        .expect(401);
    });
  });

  describe('when UPDATING a blog', () => {
    test('succeeds with status 200 when request has necessary info', async () => {
      const { singleBlogInDb } = await helper.getBlogsFromDb();
      const userId = singleBlogInDb.user;
      const user = await User.findById(userId);
      const tokenHeader = await helper.getTokenHeaderForUser(user);

      const blogToUpdate = {
        ...singleBlogInDb,
        likes: 320,
        author: 'Godzilla',
      };

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', tokenHeader)
        .send(blogToUpdate)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const { allBlogsInDb } = await helper.getBlogsFromDb();
      const allBlogAuthors = allBlogsInDb.map((blog) => blog.author);
      expect(allBlogAuthors).toContain(blogToUpdate.author);
    });
  });

  describe('when DELETING a blog by id', () => {
    test('succeeds with status 204 if id is valid', async () => {
      const { allBlogsInDb, singleBlogInDb } = await helper.getBlogsFromDb();
      const user = await User.findById(singleBlogInDb.user);
      const tokenHeader = await helper.getTokenHeaderForUser(user);
      await api
        .delete(`/api/blogs/${singleBlogInDb.id}`)
        .set('Authorization', tokenHeader)
        .expect(204);

      const response = await api.get('/api/blogs');
      const blogIds = response.body.map((blog) => blog.id);

      expect(response.body).toHaveLength(allBlogsInDb.length - 1);
      expect(blogIds).not.toContain(singleBlogInDb.id);
    });

    test('fails with status 404 if id is not in database', async () => {
      const nonExistingId = await helper.getNonExistingId();
      const { tokenHeader } = await helper.getUsersFromDb();
      await api
        .delete(`/api/blogs/${nonExistingId}`)
        .set('Authorization', tokenHeader)
        .expect(404);
    });

    test('fails with status 400 if id is malformatted', async () => {
      const invalidId = 'df423842dsjf34';
      const { tokenHeader } = await helper.getUsersFromDb();
      await api
        .delete(`/api/blogs/${invalidId}`)
        .set('Authorization', tokenHeader)
        .expect(400);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
