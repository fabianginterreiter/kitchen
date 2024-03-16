import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import RecipeForm from './RecipeForm.js';

const CREATE_RECIPE = gql`mutation Mutation($recipe: RecipeInput) {
    createRecipe(recipe: $recipe) { id }
  }`;

export default function RecipeCreate() {
    const [recipe, setRecipe] = useState({ 
        name: "", 
        source: "", 
        vegan: false, 
        vegetarian: false, 
        portions: 2, 
        description: '',
        preparations: [],
        tags: []
     });

    const [createRecipe] = useMutation(CREATE_RECIPE);

    const navigate = useNavigate();

    const saveAction = () => {
        console.log(recipe);
        createRecipe({
            variables: {
                recipe: {
                    name: recipe.name,
                    portions: parseInt(recipe.portions),
                    source: recipe.source,
                    vegan: recipe.vegan,
                    vegetarian: recipe.vegetarian,
                    description: recipe.description,
                    tags: recipe.tags,
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

    return (<div>
        <RecipeForm recipe={recipe} onChange={(r) => setRecipe(r)} />
        <button name="saveButton" className="btn btn-success" onClick={() => saveAction()}>Save</button>
    </div>);
}