import { GraphQLError } from 'graphql';

import knex from '../knex.mjs';

// A map of functions which return data for the schema.
const resolvers = {
    Query: {
        recipes: () => knex('recipes').orderBy('name'),

        recipe: (_, args) => knex('recipes').where('id', args.id).first(),

        ingredients: () => knex('ingredients').orderBy('name'),

        ingredient: (_, args) => knex('ingredients').where('id', args.id).first(),

        units: () => knex('units').orderBy('name'),

        tags: () => knex('tags').orderBy('name'),

        tag: (_, args) => knex('tags').where('id', args.id).first(),

        categories: (_, args) => {
            return knex('categories').orderBy('position').select('categories.*').then((rows => {
                if (args.includeUncategorized) {
                    return [...rows, { id: 0, name: "", position: 1000 }];
                }

                return rows;
            }));
        }
    },

    Ingredient: {
        recipes: (parent) => knex('recipes').select('recipes.*').distinct().join('preparations', 'recipes.id', '=', 'preparations.recipe_id').where('preparations.ingredient_id', parent.id).orderBy('recipes.name'),

        usages: (parent) => knex('preparations').where('ingredient_id', parent.id).count().first().then((r) => r['count(*)']),
    },

    Recipe: {
        preparations: (parent) => knex('preparations').where('recipe_id', parent.id).orderBy('step'),

        tags: (parent) => knex('tags').join('recipe_tags', 'tags.id', '=', 'recipe_tags.tag_id').where('recipe_tags.recipe_id', parent.id).select('tags.*'),

        tagIds: (parent) => knex('recipe_tags').where('recipe_id', parent.id).then((tags) => tags.map((t) => t.tag_id))
    },

    Preparation: {
        unit: (parent) => knex('units').where('id', parent.unit_id).first(),

        ingredient: (parent) => knex('ingredients').where('id', parent.ingredient_id).first()
    },

    Tag: {
        recipes: (parent) => knex('recipes').select('recipes.*').join('recipe_tags', 'recipes.id', '=', 'recipe_tags.recipe_id').where('recipe_tags.tag_id', parent.id).orderBy('recipes.name')
    },

    Category: {
        recipes: (parent) => knex('recipes').where('category_id', (parent.id === 0 ? null : parent.id)).orderBy('name')
    },

    Mutation: {
        createIngredient: (_, args) => knex('ingredients').insert({
            name: args.ingredient.name,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }).returning('id').then((obj) => knex('ingredients').where('id', obj[0].id).first()),

        updateIngredient: (_, args) => knex('ingredients').update({
            name: args.ingredient.name,
            updated_at: knex.fn.now()
        }).where('id', args.ingredient.id).then((obj) => knex('ingredients').where('id', args.ingredient.id).first()),

        deleteIngredient: (_, args) => knex('preparations').count().where('ingredient_id', args.ingredient.id).first().then((result) => {
            if (result['count(*)'] > 0) {
                throw new GraphQLError("Ingredient is still in use!");
            }
            return knex('ingredients').del().where('id', args.ingredient.id).then(() => true);
        }),

        createRecipe: (_, args) => knex('recipes').insert({
            name: args.recipe.name,
            portions: args.recipe.portions,
            vegan: args.recipe.vegan,
            vegetarian: args.recipe.vegetarian,
            description: args.recipe.description,
            source: args.recipe.source,
            category_id: args.recipe.category_id,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }).returning('id').then((obj) => {
            const recipeId = obj[0].id;

            var dbProcesses = [];

            args.recipe.preparations.forEach((n) => dbProcesses.push(knex('preparations').insert({
                step: n.step,
                description: n.description,
                amount: n.amount,
                unit_id: n.unit_id,
                ingredient_id: n.ingredient_id,
                recipe_id: recipeId
            })));

            args.recipe.tags.forEach((tag) => dbProcesses.push(knex('recipe_tags').insert({
                recipe_id: recipeId,
                tag_id: tag.id
            })));

            return Promise.all(dbProcesses).then(() => knex('recipes').where('id', recipeId).first());
        }),

        updateRecipe: (_, args) => {
            var recipe = args.recipe;

            return knex('recipes').update({
                name: recipe.name,
                portions: recipe.portions,
                vegan: recipe.vegan,
                vegetarian: recipe.vegetarian,
                description: recipe.description,
                source: recipe.source,
                category_id: recipe.category_id,
                updated_at: knex.fn.now()
            }).where('id', recipe.id)
                .then(() => knex('recipe_tags').del().where('recipe_id', recipe.id))
                .then(() => knex('preparations').where('recipe_id', recipe.id)).then((rows) => {
                    var dbProcesses = [];

                    args.recipe.tags.forEach((tag) => dbProcesses.push(knex('recipe_tags').insert({
                        recipe_id: recipe.id,
                        tag_id: tag.id
                    })));

                    var pN = 0;
                    var pE = 0;
                    var step = 1;

                    while (pE < rows.length || pN < recipe.preparations.length) {
                        if (pE < rows.length && pN < recipe.preparations.length) {
                            var p = rows[pE];
                            var n = recipe.preparations[pN];

                            dbProcesses.push(knex('preparations').update({
                                step: step,
                                title: n.title,
                                description: n.description,
                                amount: n.amount,
                                unit_id: (n.unit_id == 0 ? null : n.unit_id),
                                ingredient_id: (n.ingredient_id == 0 ? null : n.ingredient_id)
                            }).where('id', p.id));

                        } else if (pN < recipe.preparations.length && pE >= rows.length) {
                            var n = recipe.preparations[pN];

                            dbProcesses.push(knex('preparations').insert({
                                step: step,
                                title: n.title,
                                description: n.description,
                                amount: n.amount,
                                unit_id: (n.unit_id == 0 ? null : n.unit_id),
                                ingredient_id: (n.ingredient_id == 0 ? null : n.ingredient_id),
                                recipe_id: recipe.id
                            }));
                        } else if (pN >= recipe.preparations.length && pE < rows.length) {
                            var p = rows[pE];

                            dbProcesses.push(knex('preparations').where('id', p.id).del());
                        }

                        pE++; pN++; step++;
                    }

                    return Promise.all(dbProcesses);
                }).then(() => knex('recipes').where('id', recipe.id).first());
        },

        deleteRecipe: (_, args) => knex('recipe_tags').del().where('recipe_id', args.recipe.id)
            .then(() => knex('preparations').del().where('recipe_id', args.recipe.id))
            .then(() => knex('recipes').del().where('id', args.recipe.id))
            .then(() => true),

        createUnit: (_, args) => knex('units').insert({
            name: args.unit.name,
            description: args.unit.description
        }).returning('id').then((obj) => knex('units').where('id', obj[0].id).first()),

        updateUnit: (_, args) => knex('units').update({
            name: args.unit.name,
            description: args.unit.description
        }).where('id', args.unit.id).then((obj) => knex('units').where('id', args.unit.id).first()),

        deleteUnit: (_, args) => knex('preparations').count().where('unit_id', args.unit.id).first().then((result) => {
            if (result['count(*)'] > 0) {
                throw new GraphQLError("Unit is still in use!");
            }
            return knex('units').del().where('id', args.unit.id).then(() => true);
        }),

        createTag: (_, args) => knex('tags').insert({
            name: args.tag.name,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }).returning('id').then((obj) => knex('tags').where('id', obj[0].id).first()),

        updateTag: (_, args) => knex('tags').update({
            name: args.tag.name,
        }).where('id', args.tag.id).then((obj) => knex('tags').where('id', args.tag.id).first()),

        deleteTag: (_, args) => knex('recipe_tags').del().where('tag_id', args.tag.id)
            .then(() => knex('tags').del().where('id', args.tag.id))
            .then(() => true),

        createCategory: (_, args) => knex('categories').insert({
            name: args.category.name,
            position: args.category.position,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }).returning('id').then((obj) => knex('categories').where('id', obj[0].id).first()),

        updateCategory: (_, args) => knex('categories').update({
            name: args.category.name,
            position: args.category.position,
            updated_at: knex.fn.now()
        }).where('id', args.category.id).then((obj) => knex('categories').where('id', args.category.id).first()),

        deleteCategory: (_, args) => knex('recipes')
            .update({ category_id: null })
            .where('category_id', args.category.id)
            .then(() => knex('categories').del().where('id', args.category.id)
                .then(() => true)),
    }
};

export default resolvers;