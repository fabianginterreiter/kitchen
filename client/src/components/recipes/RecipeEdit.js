import './Recipe.css';

import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from "react";
import RecipeForm from './RecipeForm.js';

const GET_RECIPE = gql`query GetRecipe($recipeId: ID!) {
    recipe(id: $recipeId) {
      id, name, portions, source, description, vegan, vegetarian, category_id, preparations {
        id, step, title, amount, unit_id, ingredient_id, description
      }, tags {id, name}
    }
  }`;

const UPDATE_RECIPE = gql`mutation UpdateRecipe($recipe: RecipeInput) {
    updateRecipe(recipe: $recipe) {
        id, name, portions, source, description, vegan, vegetarian, category_id, preparations {
          id, step, title, amount, unit_id, ingredient_id, description
        }, tags {id, name}
      }
  }`;

export default function RecipeEdit() {
  const { recipeId } = useParams();

  const [recipe, setRecipe] = useState(null);

  const { loading, error } = useQuery(GET_RECIPE, {
    variables: { recipeId },
    onCompleted: (data) => {
      setRecipe(data.recipe);
    }
  });

  const [updateRecipe] = useMutation(UPDATE_RECIPE);

  const navigate = useNavigate();

  if (loading || !recipe) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <RecipeForm recipe={recipe} onChange={(recipe) => setRecipe(recipe)}
      onSave={(recipe, cb) => updateRecipe({
        variables: { recipe },
        onCompleted: (data) => {
          setRecipe(data.updateRecipe);
          cb();
        }
      })}

      onSaveAndClose={(recipe) => updateRecipe({
        variables: { recipe },
        onCompleted: (data) => navigate(`/recipes/${data.updateRecipe.id}`)
      })}
      onClose={() => navigate(`/recipes/${recipe.id}`)} />
  );
};