/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex('preparations').update({ ingredient_id: null }).where('ingredient_id', 0)
        .then(() => knex('preparations').update({ unit_id: null }).where('unit_id', 0))
        .then(() => knex.schema.table('preparations', (table) => {
            table.foreign('ingredient_id').references('id').inTable('ingredients').onDelete('RESTRICT');
            table.foreign('unit_id').references('id').inTable('units').onDelete('RESTRICT');
            table.foreign('recipe_id').references('id').inTable('recipes').onDelete('CASCADE');
        })).then(() => knex.schema.createTable('categories', table => {
            table.increments();
            table.string('name', 50);
            table.integer('position').unsigned();
            table.integer('parent_id').defaultTo(0);
            table.timestamps();

            table.foreign('parent_id').references('id').inTable('categories').onDelete('SET NULL')
        })).then(() => knex.schema.table('recipes' , table => {
            table.integer('category_id').unsigned();
            table.foreign('category_id').references('id').inTable('recipes').onDelete('SET NULL');
        }));
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('preparations', (table) => {
        table.dropForeign('ingredient_id');
        table.dropForeign('unit_id');
    }).table('recipes', table => {
        table.dropColumn('category');
    }).dropTableIfExists('categories').dropTableIfExists('tags');
};
