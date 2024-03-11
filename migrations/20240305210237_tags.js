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
        })).then(() => knex.schema.createTable('tags', table => {
            table.increments();
            table.string('name', 50).unique();
            table.timestamps();
        })).then(() => knex.schema.createTable('recipe_tags', table => {
            table.integer('recipe_id');
            table.integer('tag_id');
            table.foreign('recipe_id').references('id').inTable('recipes').onDelete('CASCADE');
            table.foreign('tag_id').references('id').inTable('tags').onDelete('CASCADE');

            table.unique(['recipe_id', 'tag_id']);
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
    }).dropTableIfExists('tags').dropTableIfExists('recipe_tags');
};
