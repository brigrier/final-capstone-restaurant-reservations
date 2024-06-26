const knex = require("../db/connection");

//GET
function list() {
  return knex("tables").select("*");
}

module.exports = {
    list
}
