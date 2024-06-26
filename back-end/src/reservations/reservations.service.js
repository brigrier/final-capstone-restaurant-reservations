const knex = require("../db/connection");

//GET 
function list(reservation_date) {
    return knex("reservations")
        .select("*")
        .where({ reservation_date })
        .orderBy("reservation_time");
}

//POST
function create(reservation) {
    return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

//READ
function read(reservation_id) {
    return knex("reservations").select("*").where({ reservation_id }).first();
  }


module.exports = {
    list,
    create,
    read
}
