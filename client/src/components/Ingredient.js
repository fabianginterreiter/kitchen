import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

const GET_INGREDIENT = gql`query GetIngredient($ingredientId: ID!) {
    ingredient(id: $ingredientId) {
      id
      name
      recipes {
        id
        name
      }
    }
  }`;

export default function Ingredients() {
    const { ingredientId } = useParams();

    const { loading, error, data } = useQuery(GET_INGREDIENT, {
        variables: { ingredientId },
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    return (
        <div>
            <h1 className="display-1">{data.ingredient.name}</h1>
            <hr />
            {data.ingredient.recipes.map(recipe =>
                <div key={recipe.id}><Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link></div>
            )}
        </div>
    );
};