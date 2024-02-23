import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';

const GET_RECIPES = gql`query GetRecipes {
    recipes {
      id, name, portions
    }
  }`;

export default function Recipes() {
    const { loading, error, data } = useQuery(GET_RECIPES);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    return (
        <div>
            <h1 className="display-1">Rezepte</h1>
            <hr />
            {data.recipes.map(recipe =>
                <div key={recipe.id}><Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link></div>
            )}
        </div>
    );
};