import { Link } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";

const GET_INGREDIENTS = gql`query GetIngredients {
    categories: ingredientsCategories(includeUncategorized:true) { id,name, ingredients { id, name, usages } }
  }`;

export default function Ingredients() {
    const { loading, error, data } = useQuery(GET_INGREDIENTS);
    const [filter, setFilter] = useState("");

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div>
            <h1>Zutaten</h1>
            <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter" />
            <ul className="categories">
                {data.categories.map(category => <li key={category.id}>
                    <div>{(category.id === "0" ? "Unkategorisiert" : category.name)}</div>
                    <ul> {category.ingredients.filter((i) => i.name.toLowerCase().includes(filter.toLowerCase())).map(ingredient => <li key={ingredient.id}>
                        <Link to={`/ingredients/${ingredient.id}`}>{ingredient.name}</Link>
                    </li>)}</ul>
                </li>)}
            </ul>
        </div >
    );
};