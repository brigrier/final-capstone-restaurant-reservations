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
    return knex("reservations")
    .select("*")
    .where({ reservation_id })
    .first();
  }

//PUT
function update(updatedReservations) {
    return knex("reservations")
    .select("*")
    .where({ reservation_id: updatedReviews.reservation_id })
    .update(updatedReservations, "*");
}


module.exports = {
    list,
    create,
    read,
    update
}
