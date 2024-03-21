import knex from '../knex.mjs';

export default function importHandler(req, res) {
    res.send("Hello <3");

    const tags = new Map();
    const units = new Map();
    const ingredients = new Map();

    req.body.forEach((recipe) => {
        recipe.tags.forEach(t => tags.set(t, 0));

        recipe.preparations.forEach((p) => {
            if (p.unit) {
                units.set(p.unit, 0);
            }

            if (p.ingredient) {
                ingredients.set(p.ingredient, 0);
            }
        });
    });

    knex('tags').select('id', 'name').whereIn('name', Array.from(tags.keys())).then((rows) => rows.forEach((tag) => tags.set(tag.name, tag.id)))
        .then(() => knex('units').select('id', 'name').whereIn('name', Array.from(units.keys())).then((rows) => rows.forEach((unit) => units.set(unit.name, unit.id))))
        .then(() => knex('ingredients').select('id', 'name').whereIn('name', Array.from(ingredients.keys())).then((rows) => rows.forEach((ingredient) => ingredients.set(ingredient.name, ingredient.id))))
        .then(() => {
            const jobs = [];

            tags.forEach((id, name) => {
                if (id == 0) {
                    jobs.push(knex('tags').insert({
                        name,
                        created_at: knex.fn.now(),
                        updated_at: knex.fn.now()
                    }).returning('id').then((obj) => tags.set(name, obj[0].id)));
                }
            });

            units.forEach((id, name) => {
                if (id == 0) {
                    jobs.push(knex('units').insert({
                        name,
                        created_at: knex.fn.now(),
                        updated_at: knex.fn.now()
                    }).returning('id').then((obj) => units.set(name, obj[0].id)));
                }
            });

            ingredients.forEach((id, name) => {
                if (id == 0) {
                    jobs.push(knex('ingredients').insert({
                        name,
                        created_at: knex.fn.now(),
                        updated_at: knex.fn.now()
                    }).returning('id').then((obj) => ingredients.set(name, obj[0].id)));
                }
            });

            return Promise.all(jobs);
        }).then(() => {

            const recipesProcesses = [];

            req.body.forEach((recipe) => {
                recipesProcesses.push(knex('recipes').insert({
                    name: recipe.name,
                    portions: recipe.portions,
                    vegan: recipe.vegan,
                    vegetarian: recipe.vegetarian,
                    description: recipe.description,
                    source: recipe.source,
                    created_at: knex.fn.now(),
                    updated_at: knex.fn.now()
                }).returning('id').then((obj) => {
                    const recipeId = obj[0].id;

                    var dbProcesses = [];

                    recipe.preparations.forEach((n) => dbProcesses.push(knex('preparations').insert({
                        step: n.step,
                        description: n.description,
                        amount: n.amount,
                        unit_id: (n.unit ? units.get(n.unit) : null),
                        ingredient_id: (n.ingredient ? ingredients.get(n.ingredient) : null),
                        recipe_id: recipeId
                    })));

                    recipe.tags.forEach((tag) => dbProcesses.push(knex('recipe_tags').insert({
                        recipe_id: recipeId,
                        tag_id: tags.get(tag)
                    })));

                    return Promise.all(dbProcesses);
                }));

                

            });

            return Promise.all(recipesProcesses);
        }).then(() => console.log("fertig!"));
}