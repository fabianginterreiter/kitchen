import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from '../ui/Utils.js';
import { Link } from 'react-router-dom';

const GET_LATEST_RECIPES = gql`query GetCategories {
    newestRecipes: recipes(sortBy:{field: "created_at", order: DESC}, limit: 5) {id,name}
    latestRecipes: recipes(sortBy:{field: "updated_at", order: DESC}, limit: 5) {id,name}

    upcomingRecipes: entries(upcoming: true, limit: 5) { id, recipe {id, name}, date}
  }`;


export default function Home() {
    const { loading, error, data } = useQuery(GET_LATEST_RECIPES);

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div>
            <h1>Welcome</h1>

            <ul className="categories">
                <li>
                    <div>Letzte Updates</div>
                    <ul>
                        {data.latestRecipes.map((recipe) => <li key={recipe.id}><Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link></li>)}
                    </ul>
                </li>
                <li>
                    <div>Neuste Rezepte</div>
                    <ul>
                        {data.newestRecipes.map((recipe) => <li key={recipe.id}><Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link></li>)}
                    </ul>
                </li>
                <li>
                    <div>Geplant</div>
                    <ul>
                        {data.upcomingRecipes.map((entry) => <li key={entry.id}><Link to={`/recipes/${entry.recipe.id}`}>{entry.recipe.name} {entry.date}</Link></li>)}
                    </ul>
                </li>
            </ul>

        </div>
    );
};