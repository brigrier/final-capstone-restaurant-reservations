const knex = require("../db/connection");

//GET
function list() {
  return knex("tables").select("*");
}

//POST
function create(table) {
    return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}


module.exports = {
    list,
    create
}
