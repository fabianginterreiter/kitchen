import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';

const GET_INGREDIENTS = gql`query GetIngredients {
    ingredients {
      id
      name
    }
  }`;

export default function Ingredients() {
    const { loading, error, data } = useQuery(GET_INGREDIENTS);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    return (
        <div className="App">
            <h1>Ingredients</h1>
            {data.ingredients.map(ingredient =>
                <div key={ingredient.id}><Link to={`/recipes/${ingredient.id}`}>{ingredient.name}</Link></div>
            )}
        </div>
    );
};