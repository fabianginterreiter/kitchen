import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Loading, Error } from '../../ui/Utils.js';

const GET_INGREDIENT = gql`query GetIngredient($ingredientId: ID!) {
    ingredient(id: $ingredientId) { id, name, recipes { id, name } }
  }`;

export default function Ingredients() {
  const { ingredientId } = useParams();

  const { loading, error, data } = useQuery(GET_INGREDIENT, {
    variables: { ingredientId },
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
       <div><Link to="/ingredients">Zutaten</Link></div>
      <h1>{data.ingredient.name}</h1>
      {data.ingredient.recipes.map(recipe =>
        <div key={recipe.id}><Link to={`/ingredients/${data.ingredient.id}/recipes/${recipe.id}`}>{recipe.name}</Link></div>
      )}
    </div>
  );
};