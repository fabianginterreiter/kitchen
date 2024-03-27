/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table('preparations', (table) => {
        table.dropUnique(['recipe_id', 'step']);
    }).then(() => knex.schema.createTable('categories', table => {
        table.increments();
        table.string('name', 50).unique();
        table.integer('position');
        table.timestamps();
    })).then(() => knex.schema.alterTable('recipes', (table) => {
        table.integer('category_id').nullable();
        table.foreign('category_id').references('id').inTable('categories').onDelete('SET NULL');
    })).then(() => knex.schema.createTable('ingredients_categories', table => {
        table.increments();
        table.string('name', 50).unique();
        table.integer('position');
        table.timestamps();
    })).then(() => knex.schema.alterTable('ingredients', (table) => {
        table.integer('category_id').nullable();
        table.foreign('category_id').references('id').inTable('ingredients_categories').onDelete('SET NULL');
    }));
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {

};
