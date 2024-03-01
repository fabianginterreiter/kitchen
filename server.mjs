import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import Knex from 'knex';

import knexfile from './knexfile.js';

const options = {
    client: 'sqlite3',
    connection: {
        filename: "./database.db"
    }
};

const knex = Knex(knexfile['development']);

// The GraphQL schema
const typeDefs = `#graphql
  type Unit {
    id: ID!
    name: String!
    description: String
  }

  type Ingredient {
    id: ID!
    name: String!
    recipes: [Recipe]
    usages: Int
  }

  type Recipe {
    id: ID!
    name: String!
    portions: Int
    source: String
    vegan: Boolean
    vegetarian: Boolean
    description: String
    preparations: [Preparation]
  }

  type Preparation {
    id: ID!
    step: Int
    title: Boolean
    amount: Float
    unit: Unit
    ingredient: Ingredient
    unit_id: ID
    ingredient_id: ID
    description: String
  }

  type Query {
    recipes: [Recipe],
    recipe(id: ID!): Recipe,

    ingredients: [Ingredient],
    ingredient(id: ID!): Ingredient,
    units: [Unit],
  }

  input PreparationInput {
    id: ID
    step: Int!
    title: Boolean
    amount: Float
    unit_id: ID
    ingredient_id: ID
    description: String
  }

  input RecipeInput {
    id: ID
    name: String!
    portions: Int
    source: String
    description: String
    vegan: Boolean
    vegetarian: Boolean
    preparations: [PreparationInput]
  }

  type Mutation {
    createIngredient(name: String!): Ingredient

    createRecipe(recipe: RecipeInput): Recipe
    updateRecipe(recipe: RecipeInput): Recipe
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
    Query: {
        recipes: () => knex('recipes').orderBy('name'),

        recipe: (_, args) => knex('recipes').where('id', args.id).first(),

        ingredients: () => knex('ingredients').orderBy('name'),

        ingredient: (_, args) => knex('ingredients').where('id', args.id).first(),

        units: () => knex('units').orderBy('name')
    },

    Ingredient: {
        recipes: (parent) => knex('recipes').select('recipes.*').distinct().join('preparations', 'recipes.id', '=', 'preparations.recipe_id').where('preparations.ingredient_id', parent.id).orderBy('name'),

        usages: (parent) => knex('preparations').where('ingredient_id', parent.id).count().first().then((r) => r['count(*)']),
    },

    Recipe: {
        preparations: (parent) => knex('preparations').where('recipe_id', parent.id).orderBy('step')
    },

    Preparation: {
        unit: (parent) => knex('units').where('id', parent.unit_id).first(),

        ingredient: (parent) => knex('ingredients').where('id', parent.ingredient_id).first()
    },

    Mutation: {
        createIngredient: (_, args) => knex('ingredients').insert({
            name: args.name,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }).returning('id').then((obj) => knex('ingredients').where('id', obj[0].id).first()),

        createRecipe: (_, args) => knex('recipes').insert({
            name: args.recipe.name,
            portions: args.recipe.portions,
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

            return Promise.all(dbProcesses).then(() => knex('recipes').where('id', recipeId).first());
        }),

        updateRecipe: (_, args) => {
            var recipe = args.recipe;

            console.log(recipe);

            return knex('recipes').update({
                name: recipe.name,
                portions: recipe.portions,
                vegan: recipe.vegan,
                vegetarian: recipe.vegetarian,
                description: recipe.description,
                source: recipe.source,
                updated_at: knex.fn.now()
            }).where('id', recipe.id).then(() => knex('preparations').where('recipe_id', recipe.id)).then((rows) => {
                var dbProcesses = [];

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
                            unit_id: n.unit_id,
                            ingredient_id: n.ingredient_id
                        }).where('id', p.id));

                    } else if (pN < recipe.preparations.length && pE >= rows.length) {
                        var n = recipe.preparations[pN];

                        dbProcesses.push(knex('preparations').insert({
                            step: step,
                            title: n.title,
                            description: n.description,
                            amount: n.amount,
                            unit_id: n.unit_id,
                            ingredient_id: n.ingredient_id,
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
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server);
console.log(`🚀 Server ready at ${url}`);