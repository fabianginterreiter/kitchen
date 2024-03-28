import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { Link } from "react-router-dom";
import './Categories.css';

const GET_CATEGORIES = gql`query GetCategories {
    categories(includeUncategorized:true) {id,name, recipes {id, name}}
  }`;


export default function Categories() {
    const { loading, error, data } = useQuery(GET_CATEGORIES);

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div className="App">
            <h1>Kategorien</h1>

            <ul className="categories">{data.categories.map((category) =>
                <li key={category.id}>
                    <div>{(category.id === "0" ? "Unkategorisiert" : category.name)}</div>
                    <ul>
                        {category.recipes.map((recipe) => <li key={recipe.id}>
                            <Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link>
                        </li>)}
                    </ul>
                </li>)}
            </ul>
        </div>
    );
};