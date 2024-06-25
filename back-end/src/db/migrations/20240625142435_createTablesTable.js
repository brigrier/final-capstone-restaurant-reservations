
exports.up = function(knex) {
    return knex.schema.createTable("tables", (table) => {
        table.increments("table_id").primary();
        table.timestamps(true, true).notNullable();
        table.string("table_name").notNullable();
        table.integer("people").notNullable();
      });
};

exports.down = function(knex) {
    return knex.schema.dropTable("tables");
};
