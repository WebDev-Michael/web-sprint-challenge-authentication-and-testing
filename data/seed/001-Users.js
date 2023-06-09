exports.seed = function (knex, Promise) {
    return knex('users')
    .truncate()
    .then(function() {
        return knex('users').insert([
            {username: "Michael Wilcox", password: 'Sept94'},
            {username: "Iris LaJean", password: 'Feb23'},
            {username: "Sierra Danielle", password: 'Jun94'},
            {username: "Richard Garies", password: "Aug41"}
        ])
    })
}