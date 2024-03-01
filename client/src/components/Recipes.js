import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { useState } from "react";

const GET_RECIPES = gql`query GetRecipes {
    recipes {
      id, name, portions
    }
  }`;

export default function Recipes() {

    const [recipes, setRecipes] = useState([]);
    const [filter, setFilter] =useState("");

    const { loading, error, data } = useQuery(GET_RECIPES, {
        onCompleted: (data) => setRecipes(data.recipes)
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    return (
        <div>
            <h1 className="display-1">Rezepte</h1>
            <hr />
            <Link to={'/recipes/create'} className="btn btn-primary">Erstellen</Link>
            <form>
              <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" value={filter} onChange={(e) => {
                setFilter(e.target.value);

                setRecipes(data.recipes.filter((r) => r.name.toLowerCase().includes(e.target.value.toLowerCase())));
              }} />
            </form>

            {recipes.map(recipe =>
                <div key={recipe.id}><Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link></div>
            )}
        </div>
    );
};