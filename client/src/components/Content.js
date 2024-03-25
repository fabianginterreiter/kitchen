import './Content.css';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../ui/Utils.js';
import { useState } from "react";
import { Link } from "react-router-dom";

const GET_CATEGORIES = gql`query GetCategories {
    categories(includeUncategorized:true) {id,name,position, recipes {id, name}}
  }`;

export default function Content({ visible, onClose }) {
    const [filter, setFilter] = useState("");

    const { loading, error, data } = useQuery(GET_CATEGORIES);

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div id="Content" className={(visible ? 'visible' : '')}>
        <header>
            <div className="searchBar">
                <input type="search" placeholder="Filter" value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <div className="close" onClick={() => onClose()}>✕</div>
        </header>
        <div className="con">
            <ul>{data.categories.map(category =>
                <li key={category.id}>
                    <a onClick={() => console.log("close")}>{category.name}</a>
                    {(category.closed ? <span /> : <ul>{category.recipes.filter(recipe => recipe.name.toLowerCase().includes(filter.toLowerCase())).map((recipe) =>
                        <li key={recipe.id}><Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link></li>
                    )}</ul>)}
                </li>)}
            </ul>
        </div>
    </div>)
}