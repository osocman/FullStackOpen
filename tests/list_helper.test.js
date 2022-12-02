const {
  totalLikes,
  favoriteBlog,
  getAuthorWithMost,
} = require('../utils/list_helper');

// DUMMY DATA

const singleBlog = [{
  _id: '5a422b891b54a676234d17fa',
  title: 'First class tests',
  author: 'Robert C. Martin',
  url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
  likes: 10,
  __v: 0,
}];

const multipleBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0,
  },
];

// TESTS

// totalLikes()
describe('totalLikes()', () => {
  test('List with zero blogs', () => {
    expect(totalLikes([])).toBe(0);
  });

  test('List with one blog', () => {
    expect(totalLikes(singleBlog)).toBe(10);
  });

  test('List with multiple blogs', () => {
    expect(totalLikes(multipleBlogs)).toBe(36);
  });
});

// favoriteBlog()
describe('favoriteBlog()', () => {
  test('with empty blog array', () => {
    expect(favoriteBlog([])).toBe(0);
  });

  test('With blog array of length 1', () => {
    expect(favoriteBlog(singleBlog)).toEqual({
      title: 'First class tests',
      author: 'Robert C. Martin',
      likes: 10,
    });
  });

  test('With blog array of length > 1', () => {
    expect(favoriteBlog(multipleBlogs)).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12,
    });
  });
});

// blogWithMost()
describe('getAuthorWithMost()', () => {
  describe('likes', () => {
    test('With empty blog array', () => {
      expect(getAuthorWithMost('likes', [])).toBe(0);
    });

    test('With blog array of length 1', () => {
      expect(getAuthorWithMost('likes', singleBlog)).toEqual({
        author: 'Robert C. Martin',
        likes: 10,
      });
    });

    test('With blog array of length > 1', () => {
      expect(getAuthorWithMost('likes', multipleBlogs)).toEqual({
        author: 'Edsger W. Dijkstra',
        likes: 17,
      });
    });
  });

  describe('blogs', () => {
    test('With empty blog array', () => {
      expect(getAuthorWithMost('blogs', [])).toBe(0);
    });

    test('With blog array of length 1', () => {
      expect(getAuthorWithMost('blogs', singleBlog)).toEqual({
        author: 'Robert C. Martin',
        blogs: 1,
      });
    });

    test('With blog array of length > 1', () => {
      expect(getAuthorWithMost('blogs', multipleBlogs)).toEqual({
        author: 'Robert C. Martin',
        blogs: 3,
      });
    });
  });
});
