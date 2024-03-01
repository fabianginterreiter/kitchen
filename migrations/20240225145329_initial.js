/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
    return knex.schema.createTable('units', table => {
        table.increments();
        table.string('name', 50).unique();
        table.string('description', 255);
        table.timestamps();
    }).createTable('ingredients', table => {
        table.increments();
        table.string('name', 50).unique();
        table.timestamps();
    }).createTable('recipes', table => {
        table.increments();
        table.string('name', 150);
        table.integer('portions').unsigned();
        table.string('source').defaultTo('');
        table.text('description').defaultTo('');
        table.boolean('vegan').defaultTo(false);
        table.boolean('vegetarian').defaultTo(false);

        table.timestamps();
    }).createTable('preparations', table => {
        table.increments();

        table.integer('recipe_id').unsigned();
        table.integer('step').unsigned();
        table.boolean('title').defaultTo(false);
        table.double('amount').unsigned();
        table.integer('ingredient_id').unsigned();
        table.integer('unit_id').unsigned();
        table.text('description').defaultTo('');

        table.foreign('recipe_id').references('recipes.id');
        table.foreign('ingredient_id').references('ingredients.id');
        table.foreign('unit_id').references('units.id');

        table.unique(['recipe_id', 'step']);
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
