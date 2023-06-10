// Write your tests here
test('sanity', () => {
  expect(true).toBe(false)
})
const request = require('supertest');
const server = require('./server');
const db = require('../data/dbConfig');


test('check environment', () => {
  expect(process.env.NODE_ENV).toBe('testing');
}) ;

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db.seed.run();
});

afterAll(async () => {
  await db.destroy();
})

describe ('GET /', () => {
  test('receives the expected message', async() => {
    let result = await request(server).get('/')
    expect(result.body).toEqual({message: "hello, world!"})
  });
  test('receives the expected status', async() => {
    let result = await request(server).get('/')
    expect(result.status).toBe(200)
  });
});

describe('POST /register', () => {
  test('adds a new user to the database', async () => {
    let result = await request(server).post('/api/auth/register').send({username: "foo", password: 'bar'});
      expect(result.status).toBe(201)
      expect(result.body).toHaveProperty('username', 'foo')
      result = await db('users').where('username', 'foo').first();
      expect(result).toBeDefined();
    });

  test('responds with proper message on invalid request parameters', async () => {
    let result = await request(server).post('/api/auth/register').send({username: "  ", password: 'password'});
    expect(result.status).toBe(400)
    expect(result.body.message).toMatch(/username and password required/)
  });

  describe('POST /login', () => {
    test('login fails if username does not exist in the database', async() => {
      let result = await request(server).post('/api/auth/login').send({username: "someuser", password: "password"})
      expect(result.status).toBe(401)
      expect(result.body).toHaveProperty('message', 'invalid credentials')
      result = await request(server).post('/api/auth/login').send({username: "someOtherUser", password: "anotherPassword"})
      expect(result.status).toBe(401)
      expect(result.body).toHaveProperty('message', 'invalid credentials')
    })
    test('delivers success message upon login', async () => {
      let result = await request(server).post('/api/auth/login').send({username: "admin", password: "1234"})
      expect(result.status).toBe(200)
      expect(result.body).toHaveProperty('message', 'welcome, admin')
    })
  })

  describe('GET /api/jokes', () => {
    test('shows joke array if token is valid', async () => {
      let res = await request(server).post('/api/auth/login').send({username: "admin", password: "1234"})
      res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
      expect(res.status).toBe(200)
    })

    test('does not allow access joke array if token is missing', async () => {
      let res = await request(server).post('/api/auth/login').send({username: "admin", password: "1234"})
      res = await request(server).get('/api/jokes')
      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('message', 'token required')
    })
  })

});