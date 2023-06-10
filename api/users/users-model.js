const db = require('../../data/dbConfig')

async function add(user) {
  const [id] = await db('users').insert(user)
  return findById(id)

}

function findById(id) {
  return db('users').where("id", id)
}


function findBy(filter) {
  return db('users as u')
  .where(filter)
  .select('username', 'password')
}

module.exports = {
  add,
  findById,
  findBy
}