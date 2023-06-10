exports.seed = async function(knex) {
    await knex('users').truncate()
    await knex('users').insert([
      {username: 'admin', password: '$2a$08$8PT25h9QBk/HmTdgicbJ/OMNf5ks.6xfFk9ntW.aDIunghb2/7IL2'} //1234
    ]);
  };