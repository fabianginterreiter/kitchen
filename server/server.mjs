import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('database.db')

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
    preparations: [PreparationInput]
  }

  type Mutation {
    createIngredient(name: String!): Ingredient

    createRecipe(recipe: RecipeInput): String
    updateRecipe(recipe: RecipeInput): Recipe

  }
`;

// A map of functions which return data for the schema.
const resolvers = {
    Query: {
        recipes: () => new Promise((resolve, reject) => {
            db.all('SELECT id, name, portions, source FROM recipes ORDER BY name ASC', (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        }),

        recipe: (parent, args, contextValue, info) => new Promise((resolve, reject) => {
            db.get(`SELECT id, name, portions, source FROM recipes WHERE id = ${args.id}`, (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(row)
                }
            })
        }),

        ingredients: () => new Promise((resolve, reject) => {
            db.all(`SELECT id, name FROM ingredients ORDER BY name ASC`, (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        }),

        ingredient: (parent, args, contextValue, info) => new Promise((resolve, reject) => {
            db.get(`SELECT id, name FROM ingredients WHERE id = ${args.id}`, (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(row)
                }
            })
        }),

        units: () => new Promise((resolve, reject) => {
            db.all(`SELECT id, name, description FROM units ORDER BY name ASC`, (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    },

    Ingredient: {
        recipes: (parent, args, contextValue, info) => new Promise((resolve, reject) => {
            db.all(`SELECT recipes.* FROM recipes JOIN preparations ON recipes.id == preparations.recipe_id WHERE preparations.ingredient_id = "${parent.id}" ORDER BY name ASC`, (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        }),

        usages: (parent) => new Promise((resolve, reject) => {
            db.get(`SELECT count() AS "usages" FROM preparations WHERE ingredient_id = '${parent.id}'`, (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res.usages)
                }
            })
        })
    },

    Recipe: {
        preparations: (parent) => new Promise((resolve, reject) => {
            db.all(`SELECT id, step, title, amount, unit_id, ingredient_id, description FROM preparations WHERE recipe_id = ${parent.id} ORDER BY step ASC`, (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    },

    Preparation: {
        unit: (parent) => new Promise((resolve, reject) => {
            db.get(`SELECT id, name, description FROM units WHERE id = ${parent.unit_id}`, (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(row)
                }
            })
        }),

        ingredient: (parent) => new Promise((resolve, reject) => {
            db.get(`SELECT id, name FROM ingredients WHERE id = ${parent.ingredient_id}`, (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(row)
                }
            })
        })
    },

    Mutation: {
        createIngredient: (_, args) => new Promise((resolve, reject) => {
            db.run(`INSERT INTO ingredients(name) VALUES('${args.name}')`, function (err) {
                if (err) {
                    reject(err)
                    return;
                }

                db.get(`SELECT id, name FROM ingredients WHERE id = ${this.lastID}`, (err, row) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(row)
                    }
                })
            })
        }),


        createRecipe: (_, args) => new Promise((resolve, reject) => {
            db.run(`INSERT INTO recipes(name, portions) VALUES('${args.recipe.name}', '${args.recipe.portions ? args.recipe.portions : 1}')`, function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                const recipeId = this.lastID;

                var dbProcesses = [];

                args.recipe.preparations.forEach((p) => dbProcesses.push(new Promise((resolve, reject) => db.run(`INSERT INTO preparations(step, description) VALUES(${p.step}, '${p.description}')`, (err, res) => resolve()))));

                Promise.all(dbProcesses).then(db.get(`SELECT id, name, portions FROM recipes WHERE id = ${args.id}`, (err, row) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(row)
                    }
                }))
            })
        }),

        updateRecipe: (_, args) => new Promise((resolve, reject) => {
            const recipe = args.recipe;

            db.run(`UPDATE recipes SET name="${recipe.name}", portions="${recipe.portions}" WHERE id = ${recipe.id}`, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                db.all(`SELECT * FROM preparations WHERE recipe_id = ${recipe.id} ORDER BY step ASC`, (err, rows) => {

                    var dbProcesses = [];

                    var pN = 0;
                    var pE = 0;
                    var step = 1;

                    while (pE < rows.length || pN < recipe.preparations.length) {
                        if (pE < rows.length && pN < recipe.preparations.length) {
                            var p = rows[pE];
                            var n = recipe.preparations[pN];
                            dbProcesses.push(new Promise((resolve, reject) => db.run(`UPDATE preparations SET step = "${step}", description = "${n.description}", ingredient_id = "${n.ingredient_id}", unit_id = "${n.unit_id}", amount = "${n.amount}" WHERE id = "${p.id}"`, (err, res) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                resolve();
                            })));


                        } else if (pN < recipe.preparations.length && pE >= rows.length) {
                            var n = recipe.preparations[pN];
                            dbProcesses.push(new Promise((resolve, reject) => db.run(`INSERT INTO preparations (recipe_id, step, description, ingredient_id, unit_id, amount) VALUES ("${recipe.id}", "${step}", "${n.description}", "${n.ingredient_id}", "${n.unit_id}", "${n.amount}") `, (err, res) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                resolve();
                            })));
                        } else if (pN >= recipe.preparations.length && pE < rows.length) {
                            var p = rows[pE];
                            dbProcesses.push(new Promise((resolve, reject) => db.run(`DELETE FROM preparations WHERE id = ${p.id}`, (err) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                resolve();
                            })))
                        }

                        pE++; pN++; step++;
                    }

                    Promise.all(dbProcesses).then(db.get(`SELECT id, name, portions FROM recipes WHERE id = ${recipe.id}`, (err, row) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(row)
                        }
                    }));
                })
            })
        })
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const { url } = await startStandaloneServer(server);
console.log(`🚀 Server ready at ${url}`);