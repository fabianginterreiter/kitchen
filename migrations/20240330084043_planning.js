/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {

    return knex.schema.createTable('lists', table => {
        table.increments();
        table.string('name', 50).unique();
        table.date('start_date').defaultTo(null);
        table.date('end_date').defaultTo(null);
        table.timestamps();
    }).createTable('lists_recipes', table => {
        table.increments();
        table.integer('recipe_id').notNullable();
        table.integer('list_id').notNullable();
        table.integer('portions').notNullable();
        table.date('date').defaultTo(null);
        table.foreign('recipe_id').references('id').inTable('recipes').onDelete('CASCADE');
        table.foreign('list_id').references('id').inTable('lists').onDelete('CASCADE');
        table.unique(['recipe_id', 'list_id']);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
    .dropTableIfExists('lists_recipes')
    .dropTableIfExists('lists');
};
