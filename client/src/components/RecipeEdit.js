import './Recipe.css';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Link, useParams } from 'react-router-dom';
import React, { useState } from "react";
// https://react-select.com/
import Select from 'react-select';

const GET_RECIPE = gql`query GetRecipe($recipeId: ID!) {
    recipe(id: $recipeId) {
      id, name, portions, preparations {
        id, step, title, amount, unit_id, ingredient_id, description
      }
    }
    units { id, name, description }
    ingredients {id, name }
  }`;

const UPDATE_RECIPE = gql`mutation UpdateRecipe($recipe: RecipeInput) {
    updateRecipe(recipe: $recipe) {
        id, name, portions, preparations {
          id, step, title, amount, unit_id, ingredient_id, description
        }
      }
  }`;

export default function RecipeEdit() {
    const { recipeId } = useParams();

    const [recipe, setRecipe] = useState({ name: "", preparations: [] });
    const [units, setUnits] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [edited, setEdited] = useState(false);

    const { loading, error, data } = useQuery(GET_RECIPE, {
        variables: { recipeId },
        onCompleted: (data) => {
            setUnits([{ value: "0", label: "" }].concat(data.units.map((unit) => ({ "value": unit.id, "label": unit.name }))));
            setIngredients([{ value: "0", label: " " }].concat(data.ingredients.map((ingredient) => ({ "value": ingredient.id, "label": ingredient.name }))));
            setRecipe(data.recipe);
        }
    });

    const [updateRecipe] = useMutation(UPDATE_RECIPE);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    const update = (recipe) => {
        setRecipe(recipe);
        setEdited(true);
    }

    const saveAction = () => {

        var step = 1;

        const result = {
            id: recipe.id,
            name: recipe.name,
            portions: parseInt(recipe.portions),
            preparations: recipe.preparations.map((p) => {
                return {
                    id: p.id,
                    step: step++,
                    ingredient_id: parseInt(p.ingredient_id),
                    unit_id: parseInt(p.unit_id),
                    amount: Number(p.amount),
                    description: p.description
                };
            })
        }

        updateRecipe({
            variables: { recipe: result },
            onCompleted: (data) => {
                setRecipe(data.updateRecipe);
                setEdited(false);
            }
        })
    }

    return (
        <div className="App">
            <Link to={`/recipes/${recipe.id}`}>Zurück</Link>

            <h1>Edit <input name="title" type="text" value={recipe.name} onChange={(e) => update({ ...recipe, name: e.target.value })} /></h1>

            Portions: <input name="portions" type="number" value={`${recipe.portions}`} onChange={(e) => update({ ...recipe, portions: parseInt(e.target.value) })} min="1" step="1" />

            <table>
                <tbody>
                    {recipe.preparations.map((step, key) => <tr key={`step_${key}`}>
                        <td className="ingredient">
                            <input name={`amount_${key}`} type="number" value={step.amount} min="0" onChange={(e) => update({
                                ...recipe,
                                preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, amount: e.target.value } : p))
                            })} />
                        </td>
                        <td className="ingredient">
                            <Select options={units}
                                defaultValue={{ label: (step.unit_id > 0 ? units.find((u) => u.value == step.unit_id).label : "") }}
                                onChange={(e) => update({
                                    ...recipe,
                                    preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, unit_id: e.value } : p))
                                })} />
                        </td>
                        <td className="ingredient">
                            <Select options={ingredients}
                                defaultValue={{ label: (step.ingredient_id > 0 ? ingredients.find((u) => u.value == step.ingredient_id).label : "") }}
                                onChange={(e) => update({
                                    ...recipe,
                                    preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, ingredient_id: e.value } : p))
                                })} />
                        </td>
                        <td className="description">
                            <textarea
                                name={`description_${key}`}
                                value={step.description ? step.description : ""}
                                onChange={(e) => update({
                                    ...recipe,
                                    preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, description: e.target.value } : p))
                                })} />
                        </td>
                        <td>
                            <button name={`removeStep_${key}`} onClick={() => update({
                                ...recipe,
                                preparations: recipe.preparations.filter((e, id) => key != id)
                            })}>Delete</button>
                            <button name={`addAfter_${key}`} onClick={() => update({
                                ...recipe,
                                preparations: recipe.preparations.filter((f, k) => k <= key).concat([{ ingredient_id: 0, unit_id: 0, amount: 0, description: "" }]).concat(recipe.preparations.filter((f, k) => k > key))
                            })}>Add After</button>
                        </td>
                    </tr>)}
                </tbody>
            </table>

            <button name="addStep" onClick={() => update({
                ...recipe,
                preparations: [...recipe.preparations,
                { ingredient_id: 0, unit_id: 0, amount: 0, description: "" }]
            })}>Add</button>

            <button name="saveButton" onClick={() => saveAction()} disabled={!edited}>Save</button>
        </div>
    );
};