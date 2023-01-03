const express = require('express');
const { authenticateToken } = require('../utils/middleware');
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

blogsRouter.post('/', authenticateToken, async (req, res, next) => {
  try {
    // adding blog to blogs
    const blog = req.body;
    blog.user = req.user.id;
    const blogToSave = new Blog(blog);
    const savedBlog = await blogToSave.save();
    // adding blog to user
    const user = await User.findById(req.user.id);
    await user.blogs.push(savedBlog.id);
    await user.save();

    res.status(201).json(savedBlog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = req.body;
    await Blog.findByIdAndUpdate(id, blog);
    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;
    const blog = await Blog.findById(blogId);

    if (!blog) res.status(404).end();

    // verify that user is owner of the blog
    if (!(blog.user.toString() === userId.toString())) {
      res.status(401).json({ error: 'a blog can only be deleted by the user that created it' });
      return;
    }
    await blog.remove();
    res.status(204).json({ deleted: blog });
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
