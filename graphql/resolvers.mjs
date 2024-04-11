import { GraphQLError } from 'graphql';

import knex from '../knex.mjs';

// A map of functions which return data for the schema.
const resolvers = {
    Query: {
        recipes: (_, { sortBy, limit }) => {
            var obj = knex('recipes');

            if (sortBy) {
                obj.orderBy(sortBy.field, sortBy.order);
            } else {
                obj.orderBy('name');
            };

            if (limit) {
                obj.limit(limit);
            }

            return obj;
        },

        recipe: (_, { id }) => knex('recipes').where('id', id).first(),

        ingredients: () => knex('ingredients').orderBy('name'),

        ingredient: (_, { id }) => knex('ingredients').where('id', id).first(),

        units: () => knex('units').orderBy('name'),

        tags: () => knex('tags').orderBy('name'),

        tag: (_, { id }) => knex('tags').where('id', id).first(),

        categories: (_, args) => knex('categories').orderBy('position').select('categories.*').then((rows => {
            if (args.includeUncategorized) {
                return [...rows, { id: 0, name: "", position: 1000 }];
            }

            return rows;
        })),

        ingredientsCategories: (_, { includeUncategorized }) => knex('ingredients_categories').orderBy('name').then((rows => {
            if (includeUncategorized) {
                return [...rows, { id: 0, name: "", position: 1000 }];
            }

            return rows;
        })),

        lists: (_, args) => {
            let obj = knex('lists');

            if ('closed' in args) {
                obj.where('closed', args.closed);
            }

            return obj;
        },

        list: (_, { id }) => knex('lists').where('id', id).first(),

        entries: (_, { upcoming, limit }) => {
            let obj = knex('lists_recipes');

            if (upcoming) {
                obj.where('date', '>', new Date().toISOString().split('T')[0]);
                obj.orderBy('date', 'asc');
            }

            if (limit > 0) {
                obj.limit(limit);
            }

            return obj;
        }
    },

    List: {
        entries: (parent) => knex('lists_recipes').where('list_id', parent.id).orderBy('date'),
        startDate: (parent) => knex('lists_recipes').where('list_id', parent.id).orderBy('date', 'asc').first()
            .then((e) => e && e.date ? e.date : null),
        endDate: (parent) => knex('lists_recipes').where('list_id', parent.id).orderBy('date', 'desc').first()
            .then((e) => e && e.date ? e.date : null),

        ingredients: (parent) => knex(knex('lists_recipes')
            .join('preparations', 'lists_recipes.recipe_id', '=', 'preparations.recipe_id')
            .where('lists_recipes.list_id', parent.id)
            .where('preparations.amount', '>', 0)
            .join('recipes', 'lists_recipes.recipe_id', '=', 'recipes.id')
            .select(knex.raw('preparations.amount / recipes.portions * lists_recipes.portions as amount'), 'preparations.unit_id', 'preparations.ingredient_id').as('ings'))
            .groupBy('unit_id', 'ingredient_id')
            .sum('amount as amount')
            .select('unit_id', 'ingredient_id')
    },

    Entry: {
        recipe: (parent) => knex('recipes').where('id', parent.recipe_id).first()
    },

    ListIngredient: {
        unit: (parent) => knex('units').where('id', parent.unit_id).first(),

        ingredient: (parent) => knex('ingredients').where('id', parent.ingredient_id).first()
    },

    Ingredient: {
        recipes: (parent) => knex('recipes').select('recipes.*').distinct().join('preparations', 'recipes.id', '=', 'preparations.recipe_id').where('preparations.ingredient_id', parent.id).orderBy('recipes.name'),

        usages: (parent) => knex('preparations').where('ingredient_id', parent.id).count().first().then((r) => r['count(*)']),

        category: (parent) => knex('ingredients_categories').where('id', parent.category_id).first()
    },

    Recipe: {
        preparations: (parent) => knex('preparations').where('recipe_id', parent.id).orderBy('step'),

        tags: (parent) => knex('tags').join('recipe_tags', 'tags.id', '=', 'recipe_tags.tag_id').where('recipe_tags.recipe_id', parent.id).select('tags.*'),

        tagIds: (parent) => knex('recipe_tags').where('recipe_id', parent.id).then((tags) => tags.map((t) => t.tag_id)),

        ingredients: (parent) => knex('preparations').where('recipe_id', parent.id).join('ingredients', 'ingredients.id', '=', 'preparations.ingredient_id').select('ingredients.*').distinct()
    },

    Preparation: {
        unit: ({ unit_id }) => knex('units').where('id', unit_id).first(),

        ingredient: ({ ingredient_id }) => knex('ingredients').where('id', ingredient_id).first()
    },

    Tag: {
        recipes: ({ id }) => knex('recipes').select('recipes.*').join('recipe_tags', 'recipes.id', '=', 'recipe_tags.recipe_id').where('recipe_tags.tag_id', id).orderBy('recipes.name')
    },

    Category: {
        recipes: ({ id }) => knex('recipes').where('category_id', (id === 0 ? null : id)).orderBy('name')
    },

    IngredientsCategory: {
        ingredients: ({ id }) => knex('ingredients').where('category_id', (id === 0 ? null : id)).orderBy('name')
    },

    Mutation: {
        createIngredient: (_, args) => knex('ingredients').insert({
            name: args.ingredient.name,
            category_id: args.ingredient.category_id,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }).returning('id').then((obj) => knex('ingredients').where('id', obj[0].id).first()),

        updateIngredient: (_, args) => knex('ingredients').update({
            name: args.ingredient.name,
            category_id: args.ingredient.category_id,
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

        createTag: (_, { tag }) => knex('tags').insert({
            name: tag.name,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }).returning('id').then((obj) => knex('tags').where('id', obj[0].id).first()),

        updateTag: (_, { tag }) => knex('tags').update({
            name: tag.name,
        }).where('id', tag.id).then((obj) => knex('tags').where('id', tag.id).first()),

        deleteTag: (_, { tag }) => knex('recipe_tags').del().where('tag_id', tag.id)
            .then(() => knex('tags').del().where('id', tag.id))
            .then(() => true),

        createCategory: (_, { category }) => knex('categories').insert({
            name: category.name,
            position: category.position,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }).returning('id').then((obj) => knex('categories').where('id', obj[0].id).first()),

        updateCategory: (_, { category }) => knex('categories').update({
            name: category.name,
            position: category.position,
            updated_at: knex.fn.now()
        }).where('id', category.id).then((obj) => knex('categories').where('id', category.id).first()),

        deleteCategory: (_, args) => knex('recipes')
            .update({ category_id: null })
            .where('category_id', args.category.id)
            .then(() => knex('categories').del().where('id', args.category.id)
                .then(() => true)),

        createIngredientsCategory: (_, args) => knex('ingredients_categories').insert({
            name: args.category.name,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }).returning('id').then((obj) => knex('ingredients_categories').where('id', obj[0].id).first()),

        updateIngredientsCategory: (_, args) => knex('ingredients_categories').update({
            name: args.category.name,
            updated_at: knex.fn.now()
        }).where('id', args.category.id).then((obj) => knex('ingredients_categories').where('id', args.category.id).first()),

        deleteIngredientsCategory: (_, args) => knex('ingredients')
            .update({ category_id: null })
            .where('category_id', args.category.id)
            .then(() => knex('ingredients_categories').del().where('id', args.category.id)
                .then(() => true)),

        createList: (_, { list }) => knex('lists').insert({
            name: list.name,
            description: list.description,
            closed: list.closed,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }).returning('id').then((obj) => Promise.all(list.entries.map((entry) => knex('lists_recipes').insert({
            list_id: obj[0].id,
            recipe_id: entry.recipe_id,
            portions: entry.portions,
            date: entry.date
        }))).then(() => knex('lists').where('id', obj[0].id).first())),

        updateList: (_, { list }) => knex('lists').update({
            name: list.name,
            description: list.description,
            closed: list.closed,
            updated_at: knex.fn.now()
        }).where('id', list.id).then(() => Promise.all(list.entries.map((entry) => {
            if (entry.id) {
                return knex('lists_recipes').update({
                    recipe_id: entry.recipe_id,
                    portions: entry.portions,
                    date: entry.date
                }).where('id', entry.id).returning('id').then((obj) => obj[0].id);
            } else {
                return knex('lists_recipes').insert({
                    list_id: list.id,
                    recipe_id: entry.recipe_id,
                    portions: entry.portions,
                    date: entry.date
                }).returning('id').then((obj) => obj[0].id);
            }
        })))
            .then((results) => knex('lists_recipes').where('list_id', list.id).whereNotIn('id', results).del())
            .then(() => knex('lists').where('id', list.id).first()),

        deleteList: (_, { list }) => knex('lists_recipes').where('list_id', list.id).del()
            .then(() => knex('lists').where('id', list.id).del())
            .then(() => true)
    }
};

export default resolvers;