import './Recipe.css';

import { useQuery, useMutation, gql } from '@apollo/client';
import { Link, useParams } from 'react-router-dom';
import { useState } from "react";
import RecipeForm from './RecipeForm.js';

const GET_RECIPE = gql`query GetRecipe($recipeId: ID!) {
    recipe(id: $recipeId) {
      id, name, portions, source, description, vegan, vegetarian, preparations {
        id, step, title, amount, unit_id, ingredient_id, description
      }, tags {id, name}
    }
  }`;

const UPDATE_RECIPE = gql`mutation UpdateRecipe($recipe: RecipeInput) {
    updateRecipe(recipe: $recipe) {
        id, name, portions, source, description, vegan, vegetarian, preparations {
          id, step, title, amount, unit_id, ingredient_id, description
        }, tags {id, name}
      }
  }`;

export default function RecipeEdit() {
    const { recipeId } = useParams();

    const [recipe, setRecipe] = useState({ name: "", preparations: [] });
    const [edited, setEdited] = useState(false);

    const { loading, error, data } = useQuery(GET_RECIPE, {
        variables: { recipeId },
        onCompleted: (data) => {
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
        updateRecipe({
            variables: {
                recipe: {
                    id: recipe.id,
                    name: recipe.name,
                    portions: recipe.portions,
                    vegan: recipe.vegan,
                    vegetarian: recipe.vegetarian,
                    description: recipe.description,
                    source: recipe.source,
                    tags: recipe.tags.map((t) => ({id: t.id, name: t.name})),
                    preparations: recipe.preparations.map((p, k) => ({
                        id: p.id,
                        step: k+1,
                        title: p.title,
                        ingredient_id: Number(p.ingredient_id),
                        unit_id: p.unit_id,
                        amount: Number(p.amount),
                        description: p.description
                    }))
                }
            },
            onCompleted: (data) => {
                setRecipe(data.updateRecipe);
                setEdited(false);
            }
        })
    }

    return (
        <div className="App">
            <Link to={`/recipes/${recipe.id}`}>Zurück</Link>

            <RecipeForm recipe={recipe} onChange={(r) => update(r)} />

            <button name="cancelButton" className="btn btn-danger" onClick={() => setRecipe(data.recipe)}>Abbrechen</button>
            <button name="saveButton" className="btn btn-success" onClick={() => saveAction()} disabled={!edited}>Save</button>
        </div>
    );
};