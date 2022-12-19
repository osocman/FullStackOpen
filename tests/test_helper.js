const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Blog = require('../models/blog');

const initialBlogs = [{
  _id: '637f47bfd80dcf7bc07dc110',
  title: 'The first blog',
  author: 'Tolkien',
  url: 'www.somebrokenlink.com',
  likes: 15,
  __v: 0,
},
{
  _id: '63847a98f0c6149438a0f8be',
  title: 'Time for more',
  author: 'J.K. Rowling',
  url: 'www.antoherbrokenlink.net',
  likes: 12,
  __v: 0,
},
{
  _id: '638f3198efe09a3cbedaca5d',
  title: 'The Third King',
  author: 'Micheal Jackson',
  url: 'www.Jackson.io',
  likes: 2,
  __v: 0,
},
{
  _id: '6391d6e6cf56d772da0553f9',
  title: 'A New Virtual Space',
  author: 'Mister Maniac',
  url: 'www.mania.com',
  likes: 32,
  __v: 0,
}];

const initialUsers = [{
  username: 'PizzaMan9000',
  name: 'Johnson',
}, {
  username: 'JustDavy',
  name: 'Davy Johnes',
}];

const usersWithPassword = async () => {
  const generateHash = async (password) => {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  };

  // generate passwordhashes
  const passwords = ['flyingPizza', 'TheBlackPearl', 'someBadPass', 'mySecret'];
  const promiseArray = passwords.map((password) => generateHash(password));
  const passwordHashes = await Promise.all(promiseArray);

  initialUsers.forEach((user, i) => {
    // eslint-disable-next-line no-param-reassign
    user.passwordHash = passwordHashes[i];
  });

  return initialUsers;
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const nonExistingId = async () => {
  const blogToDelete = new Blog({
    title: 'This Blog will be deleted',
    author: 'because the id will be used as a nonexisting id',
    url: 'www.website.nl',
  });
  await blogToDelete.save();
  await blogToDelete.delete();
  return blogToDelete._id.toString();
};

module.exports = {
  initialBlogs,
  blogsInDb,
  nonExistingId,
  initialUsers,
  usersWithPassword,
};
