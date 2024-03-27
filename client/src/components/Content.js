import './Content.css';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../ui/Utils.js';
import { useState } from "react";
import { Link } from "react-router-dom";

const GET_CATEGORIES = gql`query GetCategories {
    categories(includeUncategorized:true) {id,name,position, recipes {id, name}}
  }`;

function BoldedText({ text, filter }) {
    if (filter === "") {
        return text;
    }

    const textArray = text.split(new RegExp(filter, 'i') );
    return (
        <>
            {textArray.map((item, index) => (
                <>
                    {item}
                    {index !== textArray.length - 1 && (
                        <span className="marked">{filter}</span>
                    )}
                </>
            ))}
        </>
    );
}

export default function Content({ visible, onClose }) {
    const [filter, setFilter] = useState("");
    const [closed, setClosed] = useState([]);

    const { loading, error, data } = useQuery(GET_CATEGORIES);

    const isClosed = (category) => closed.find((id) => id == category.id);

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
            <ul>{data.categories.map(category => {
                if (category.recipes.length === 0) { return <li key={category.id} /> }

                const open = !isClosed(category);
                const recipes = filter === "" ? category.recipes : category.recipes.filter(recipe => recipe.name.toLowerCase().includes(filter.toLowerCase()));

                const number = recipes.length < category.recipes.length ? `(${recipes.length} / ${category.recipes.length})` : (!open ? `(${category.recipes.length})` : "");

                return <li key={category.id}>
                    <a onClick={() => {
                        if (!open) {
                            setClosed(closed.filter((id) => id != category.id));
                        } else {
                            setClosed([...closed, category.id]);
                        }
                    }}>{(open ? "" : "❯ ")}{(category.id === "0" ? "Unkategorisiert" : category.name)} {number}</a>
                    {(!open ? <span /> : <ul>{recipes.map((recipe) =>
                        <li key={recipe.id}><Link to={`/recipes/${recipe.id}`}><BoldedText text={recipe.name} filter={filter} /></Link></li>
                    )}</ul>)}
                </li>;
            })}
            </ul>
        </div>
    </div>)
}