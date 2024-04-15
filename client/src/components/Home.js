import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from '../ui/Utils.js';
import { Link } from 'react-router-dom';
import { formatDate } from '../ui/DateUtils.js';
import { useTranslation } from 'react-i18next';

const GET_LATEST_RECIPES = gql`query GetCategories {
    newestRecipes: recipes(sortBy:{field: "created_at", order: DESC}, limit: 5) {id,name}
    latestRecipes: recipes(sortBy:{field: "updated_at", order: DESC}, limit: 5) {id,name}

    upcomingRecipes: entries(upcoming: true, limit: 5) { id, recipe {id, name}, date}

    lists: lists(active: true, closed: false) { id, name }
  }`;


export default function Home() {
    const { t } = useTranslation();
    const { loading, error, data } = useQuery(GET_LATEST_RECIPES);

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div>
            <h1>{(t('home.welcome'))}</h1>

            <ul className="categories">
                <li>
                    <div>{t('home.lastUpdates')}</div>
                    <ul>
                        {data.latestRecipes.map((recipe) => <li key={recipe.id}><Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link></li>)}
                    </ul>
                </li>
                <li>
                    <div>{t('home.justCreated')}</div>
                    <ul>
                        {data.newestRecipes.map((recipe) => <li key={recipe.id}><Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link></li>)}
                    </ul>
                </li>
                <li>
                    <div>{t('home.planned')}</div>
                    <ul>
                        {data.upcomingRecipes.map((entry) => <li key={entry.id}><Link to={`/recipes/${entry.recipe.id}`}>{entry.recipe.name} ({formatDate(new Date(entry.date))})</Link></li>)}
                    </ul>
                </li>

                <li>
                    <div>{t('home.activeLists')}</div>
                    <ul>
                        {data.lists.map((list) => <li key={list.id}><Link to={`/lists/${list.id}`}>{list.name}</Link></li>)}
                    </ul>
                </li>
            </ul>

        </div>
    );
};