/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
    return knex.schema.createTable('units', table => {
        table.increments();
        table.string('name');
        table.string('description');
        table.timestamps();

        table.unique('id');
        table.unique('name');
    }).createTable('ingredients', table => {
        table.increments();
        table.string('name');
        table.timestamps();

        table.unique('id');
        table.unique('name');
    }).createTable('recipes', table => {
        table.increments();
        table.string('name');
        table.integer('portions').unsigned();
        table.string('source');
        table.string('description');
        table.boolean('vegan');
        table.boolean('vegetarian');

        table.timestamps();

        table.unique('id');
        table.unique('name');
    }).createTable('preparations', table => {
        table.increments();

        table.integer('recipe_id').unsigned();
        table.foreign('recipe_id').references('recipes.id');

        table.integer('step').unsigned();

        table.double('amount').unsigned();

        table.integer('ingredient_id').unsigned();

        table.integer('unit_id').unsigned();

        table.text('description');

        table.timestamps();

        table.unique('id');
        table.unique(['recipe_id', 'step']);

        table.foreign('ingredient_id').references('ingredients.id');
        table.foreign('unit_id').references('units.id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('preparations')
        .dropTableIfExists('recipes')
        .dropTableIfExists('units')
        .dropTableIfExists('ingredients');
};
