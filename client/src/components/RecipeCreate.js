import { useQuery, useMutation, gql } from '@apollo/client';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from "react";
// https://react-select.com/
import Select from 'react-select';
import RecipeForm from './RecipeForm.js';


const CREATE_RECIPE = gql`mutation Mutation($recipe: RecipeInput) {
    createRecipe(recipe: $recipe) { id }
  }`;

export default function RecipeCreate() {
    const [recipe, setRecipe] = useState({ name: "", source: "", portions: 2, preparations: [] });

    const [createRecipe] = useMutation(CREATE_RECIPE);

    const navigate = useNavigate();

    const saveAction = () => {
        createRecipe({
            variables: {
                recipe: {
                    name: recipe.name,
                    portions: parseInt(recipe.portions),
                    preparations: recipe.preparations.map((p, key) => ({
                        id: p.id,
                        step: key + 1,
                        ingredient_id: parseInt(p.ingredient_id),
                        unit_id: parseInt(p.unit_id),
                        amount: Number(p.amount),
                        description: p.description
                    }))
                }
            },
            onCompleted: (data) => {
                navigate(`/recipes/${data.createRecipe.id}`);
            }
        })
    }

    return (<div><RecipeForm recipe={recipe} onChange={(r) => setRecipe(r)} />
        <button name="saveButton" className="btn btn-success" onClick={() => saveAction()}>Save</button>

    </div>);
}