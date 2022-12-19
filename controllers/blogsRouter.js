const express = require('express');
const { findById } = require('../models/blog');
const Blog = require('../models/blog');
const User = require('../models/user');

const blogsRouter = express.Router();

blogsRouter.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', {
      username: 1,
      name: 1,
    });
    res.json(blogs);
  } catch (error) { next(error); }
});

blogsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (blog) {
      res.status(200).json(blog);
    } else {
      res.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.post('/', async (req, res, next) => {
  try {
    const blog = req.body;

    // if no user was added to the blog, add a random user
    if (!blog.user) {
      const randomUser = await User.findOne({});
      console.log(`User: ${randomUser.id}`);
      blog.user = randomUser;
    }

    const blogToSave = new Blog(blog);
    const savedBlog = await blogToSave.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = req.body;
    await Blog.findByIdAndUpdate(id, blog);
    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (blog) {
      await blog.remove();
      res.status(204).json({ deleted: blog });
    } else {
      res.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
