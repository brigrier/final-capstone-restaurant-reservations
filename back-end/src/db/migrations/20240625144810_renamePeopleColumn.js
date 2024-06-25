exports.up = function (knex) {
  return knex.schema.table("tables", (table) => {
    table.renameColumn("people", "capacity");
  });
};

exports.down = function (knex) {
  return knex.schema.table("tables", (table) => {
    table.renameColumn("capacity", "people");
  });
};
