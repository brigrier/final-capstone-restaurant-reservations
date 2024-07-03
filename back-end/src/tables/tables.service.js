const knex = require("../db/connection");

// GET
function list() {
  return knex("tables").select("*").orderBy("table_name");
}

// POST
function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

// READ FOR PUT USAGE
function read(table_id) {
  return knex("tables").select("*").where({ table_id }).first();
}

// PUT
function update(updatedTable) {
  return knex("tables")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

//DELETE
function destroy(table_id) {
  return knex("tables").where({ table_id }).del();
}

function unseat(table_id, reservation_id) {
  return knex("reservations")
    .where({ reservation_id })
    .update({ status: "finished" })
    .returning("*")
    .then(() => {
      return knex("tables")
        .where({ table_id })
        .update({ reservation_id: null })
        .returning("*");
    });
}

module.exports = {
  list,
  create,
  read,
  update,
  destroy,
  unseat,
};
