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
        category_id: null,
        preparations: [],
        tags: []
    });

    const [createRecipe] = useMutation(CREATE_RECIPE);

    const navigate = useNavigate();

    return (<div>
        <RecipeForm recipe={recipe} onChange={(r) => setRecipe(r)}
            onSave={(recipe) => createRecipe({
                variables: {
                    recipe
                },
                onCompleted: (data) =>
                    navigate(`/recipes/${data.createRecipe.id}/edit`)
            })}
            onSaveAndClose={(recipe) => createRecipe({
                variables: {
                    recipe
                },
                onCompleted: (data) =>
                    navigate(`/recipes/${data.createRecipe.id}`)
            })}
            onClose={() => navigate('/recipes')} />
    </div>);
}