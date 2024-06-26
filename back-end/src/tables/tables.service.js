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

//READ FOR PUT USAGE
function read(table_id) {
  return knex("tables").select("*").where({ table_id }).first();
}

//PUT
function update(updatedTables) {
  return knex("tables")
    .select("*")
    .where({ table_id: updatedTables.table_id })
    .update(updatedTables, "*");
}


module.exports = {
    list,
    create,
    read, 
    update
}
