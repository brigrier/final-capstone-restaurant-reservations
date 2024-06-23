const knex = require("../db/connection");

//GET 
function list(reservation_date) {
    return knex("reservations")
        .select("*")
        .where({ reservation_date })
        .orderBy("reservation_time");
}

module.exports = {
    list,
}
