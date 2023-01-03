/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Blog = require('../models/blog');
const { unsubscribe } = require('../app');

const blogData = [
  {
    title: 'The first blog',
    author: 'Tolkien',
    url: 'www.somebrokenlink.com',
    likes: 15,
    __v: 0,
  },
  {
    title: 'Time for more',
    author: 'J.K. Rowling',
    url: 'www.antoherbrokenlink.net',
    likes: 12,
    __v: 0,
  },
  {
    title: 'The Third King',
    author: 'Micheal Jackson',
    url: 'www.Jackson.io',
    likes: 2,
    __v: 0,
  },
  {
    title: 'A New Virtual Space',
    author: 'Mister Maniac',
    url: 'www.mania.com',
    likes: 32,
    __v: 0,
  },
];

const userData = [
  {
    username: 'PizzaMan9000',
    name: 'Johnson',
    blogs: [],
  },
  {
    username: 'JustDavy',
    name: 'Davy Johnes',
    blogs: [],
  },
];

const givePasswordHashTo = async (userArray) => {
  const generateHash = async (password) => {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  };

  // generate passwordhashes
  const passwords = ['flyingPizza', 'TheBlackPearl', 'someBadPass', 'mySecret'];
  const promiseArray = passwords.map((password) => generateHash(password));
  const passwordHashes = await Promise.all(promiseArray);

  userArray.forEach((user, i) => {
    // eslint-disable-next-line no-param-reassign
    user.passwordHash = passwordHashes[i];
  });

  return userArray;
};
const getTokenHeaderForUser = async (user) => {
  const userPayload = { username: user.username, id: user.id };
  const token = jwt.sign(userPayload, process.env.SECRET);
  return `bearer ${token}`;
};

const getBlogsFromDb = async () => {
  let allBlogsInDb = await Blog.find({});
  allBlogsInDb = allBlogsInDb.map((blog) => blog.toJSON());

  const singleBlogInDb = allBlogsInDb[0];

  return { singleBlogInDb, allBlogsInDb };
};

const getUsersFromDb = async () => {
  let allUsersInDb = await User.find({});
  allUsersInDb = allUsersInDb.map((user) => user.toJSON());

  const singleUserInDb = allUsersInDb[0];

  const tokenHeader = await getTokenHeaderForUser(singleUserInDb);

  return { allUsersInDb, singleUserInDb, tokenHeader };
};

const getNonExistingId = async () => {
  const blogToDelete = new Blog({
    title: 'This Blog will be deleted',
    author: 'because the id will be used as a nonexisting id',
    url: 'www.website.nl',
    user: '63a033c0a9ff89db50852df4',
  });
  await blogToDelete.save();
  await blogToDelete.delete();
  return blogToDelete._id.toString();
};

const saveObjectsInDb = async (arrayOfObjects, MongooseModel) => {
  const mongooseDocuments = arrayOfObjects.map((obj) => new MongooseModel(obj));
  const savePromises = mongooseDocuments.map((doc) => doc.save());
  await Promise.all(savePromises);
};

const generateInitialData = async () => {
  const usersWithPasswordHash = await givePasswordHashTo(userData);

  // save to database, so the users and blogs get assigned an id property
  await saveObjectsInDb(usersWithPasswordHash, User);
  await saveObjectsInDb(blogData, Blog);

  const { allUsersInDb: allUsers } = await getUsersFromDb();
  const { allBlogsInDb: allBlogs } = await getBlogsFromDb();

  // fill blogs and users property with each others id's
  allBlogs.forEach((blog, i) => {
    const odd = i % 2;
    if (odd) {
      blog.user = allUsers[0].id;
      allUsers[0].blogs.push(blog.id);
    } else {
      blog.user = allUsers[1].id;
      allUsers[1].blogs.push(blog.id);
    }
  });

  // update blogs and users with the added id's
  const saveUsers = allUsers.map((user) => User.findByIdAndUpdate(user.id, { blogs: user.blogs }));
  await Promise.all(saveUsers);
  const saveBlogs = allBlogs.map((blog) => Blog.findByIdAndUpdate(blog.id, { user: blog.user }));
  await Promise.all(saveBlogs);
};

module.exports = {
  blogData,
  userData,
  generateInitialData,
  getBlogsFromDb,
  getUsersFromDb,
  getNonExistingId,
  getTokenHeaderForUser,
  givePasswordHashTo,
};
