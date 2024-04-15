import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import { useTranslation } from 'react-i18next';

const GET_INGREDIENTS = gql`query GetIngredients {
    categories: ingredientsCategories(includeUncategorized:true) { id,name, ingredients { id, name, usages } }
  }`;

export default function Ingredients() {
    const { t } = useTranslation();
    const { loading, error, data } = useQuery(GET_INGREDIENTS);
    const [filter, setFilter] = useState("");

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div>
            <h1>{t('ingredients')}</h1>
            
            <fieldset>
                <legend>{t('ingredients.filter')}</legend>
                <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t('ingredients.filter')} />
            </fieldset>

            <ul>
                {data.categories.map(category => <li key={category.id}>
                    <div>{(category.id === "0" ? t('ingredients.uncategorized') : category.name)}</div>
                    <ul> {category.ingredients.filter((i) => i.name.toLowerCase().includes(filter.toLowerCase())).map(ingredient => <li key={ingredient.id}>
                        <Link to={`/ingredients/${ingredient.id}`}>{ingredient.name}</Link>
                    </li>)}</ul>
                </li>)}
            </ul>
        </div >
    );
};