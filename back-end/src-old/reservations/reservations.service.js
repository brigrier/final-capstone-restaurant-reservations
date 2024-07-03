const knex = require("../db/connection");

//GET 
function list(reservation_date) {
    return knex("reservations")
        .select("*")
        .where({ reservation_date })
        .whereNot({ status: "finished" })
        .orderBy("reservation_time");
}

//GET BY NUMBER
function search(mobile_number) {
    return knex("reservations")
      .whereRaw(
        "translate(mobile_number, '() -', '') like ?",
        `%${mobile_number.replace(/\D/g, "")}%`
      )
      .orderBy("reservation_date");
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
    .where({ reservation_id: updatedReservations.reservation_id })
    .update(updatedReservations, "*");
}


module.exports = {
    list,
    search,
    create,
    read,
    update
}
