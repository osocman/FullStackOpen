const mongoose = require('mongoose');
const supertest = require('supertest');
const User = require('../models/user');
const helper = require('./test_helper');
const app = require('../app');

const api = supertest(app);

// ! Still have to implement all tests for 4.16

beforeEach(async () => {
  await User.deleteMany({});
  const initialUsers = await helper.usersWithPassword();
  const userObjects = initialUsers.map((user) => new User(user));
  const promiseArray = userObjects.map((user) => user.save(user));
  await Promise.all(promiseArray);
});

describe('posting a user', () => {
  test('succeeds with 201 if request is valid', async () => {
    const response = await api
      .post('/api/users')
      .send({
        username: 'Batman',
        password: '123iHateTheJoker',
        name: 'unknown',
      })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const { body: allUsers } = await api.get('/api/users');
    expect(allUsers).toHaveLength(helper.initialUsers.length + 1);

    const allUsernames = allUsers.map((user) => user.username);
    expect(allUsernames).toContain('Batman');
  });

  test.only('fails with 400 and validationError if username invalid', async () => {
    const invalidUsername = 'Joe';
    const response = await api
      .post('/api/users')
      .send({
        username: invalidUsername,
        password: 'ThisIsSomePass',
        name: 'Tyson',
      })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    console.log(response.body);
  });

  test('fails with 400 and the right error message if username is not unique', async () => {
    const duplicateUsername = 'PizzaMan9000';
    const response = await api
      .post('/api/users')
      .send({
        username: duplicateUsername,
        password: 'MyUsernameIsDuplicate',
        name: 'Peter',
      })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(response.body.error).toEqual(['username is already taken']);
  });

  test('fails with 400 and the right error message if invalid password', async () => {
    const invalidPassword = 'pass';
    const response = await api
      .post('/api/users')
      .send({
        username: 'SomeUserNameForTesting',
        password: invalidPassword,
        name: 'Peter',
      })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(response.body.error).toEqual(['password must be longer than 5 characters']);
  });

  test('fails with 400 and the right error messages if username is not unique and password invalid', async () => {
    const duplicateUsername = 'PizzaMan9000';
    const invalidPassword = 'pass';
    const response = await api
      .post('/api/users')
      .send({
        username: duplicateUsername,
        password: invalidPassword,
        name: 'Peter',
      })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(response.body.error).toEqual(['username is already taken', 'password must be longer than 5 characters']);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
