import knex from '../knex.mjs';

const exportHandler = (req, res) => {
    knex('tags').then((tags) => {
        knex('recipe_tags').then((recipeTags) => {
            knex('ingredients').then((ingredients) => {
                knex('units').then((units) => {
                    knex('preparations').orderBy('step').then((preparations) => {
                        knex('recipes').then((recipes) => {
                            res.send(recipes.map((recipe) => ({
                                name: recipe.name,
                                portions: recipe.portions,
                                description: recipe.description,
                                source: recipe.source,
                                vegan: recipe.vegan == true,
                                vegetarian: recipe.vegetarian == true,
                                tags: recipeTags.filter(r => r.recipe_id === recipe.id).map(r => tags.find(t => t.id === r.tag_id).name),
                                preparations: preparations.filter(p => p.recipe_id === recipe.id).map(p => ({
                                    step: p.step,
                                    title: p.title == true,
                                    amount: p.amount,
                                    unit: p.unit_id > 0 ? units.find(u => u.id === p.unit_id).name : null,
                                    ingredient: p.ingredient_id > 0 ? ingredients.find(i => i.id === p.ingredient_id).name : null,
                                    description: p.description
                                }))
                            })))
                        });
                    });
                });
            });
        });
    });
};

export default exportHandler;