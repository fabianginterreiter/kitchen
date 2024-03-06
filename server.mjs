import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { GraphQLError } from 'graphql';

import Knex from 'knex';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import knexfile from './knexfile.js';

const knex = Knex(knexfile[process.env.NODE_ENV != null ? process.env.NODE_ENV : 'development']);

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

  input UnitInput {
    id: ID,
    name: String!,
    description: String
  }

  input IngredientInput {
    id: ID,
    name: String!
  }

  type Mutation {
    createIngredient(ingredient: IngredientInput): Ingredient
    updateIngredient(ingredient: IngredientInput): Ingredient
    deleteIngredient(ingredient: IngredientInput): String

    createRecipe(recipe: RecipeInput): Recipe
    updateRecipe(recipe: RecipeInput): Recipe

    createUnit(unit: UnitInput): Unit
    updateUnit(unit: UnitInput): Unit
    deleteUnit(unit: UnitInput): String
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
            return knex('ingredients').del().where('id', args.ingredient.id).then(() => "OK");
        }),

        createRecipe: (_, args) => knex('recipes').insert({
            name: args.recipe.name,
            portions: args.recipe.portions,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            description: recipe.description,
            source: recipe.source,
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
            return knex('units').del().where('id', args.unit.id).then(() => "OK");
        })
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault()]
});

await server.start();

const app = express();

app.use(
    '/data',
    cors(),
    bodyParser.json(),
    expressMiddleware(server),
);

app.use(express.static('public'));

app.get('*', (req, res) => {
    res.sendFile(`${process.cwd()}/public/index.html`, (err) => {
        if (err) {
            res.status(500).send(err)
        }
    })
});

app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000`)
);