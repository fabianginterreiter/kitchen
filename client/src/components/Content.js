import './Content.css';
import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from '../ui/Utils.js';
import { Fragment, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const GET_CATEGORIES = gql`query GetCategories {
    categories(includeUncategorized:true) {id,name,position, recipes {id, name}}
  }`;

function BoldedText({ text, filter }) {
    if (filter === "") {
        return text;
    }

    const textArray = text.split(new RegExp(filter, 'i'));
    return (
        <>
            {textArray.map((item, index) => (
                <Fragment key={index}>
                    {item}
                    {index !== textArray.length - 1 && (
                        <span className="marked">{filter}</span>
                    )}
                </Fragment>
            ))}
        </>
    );
}

export default function Content({ visible, onClose }) {
    const { t } = useTranslation();

    const [filter, setFilter] = useState("");
    const [closed, setClosed] = useState([]);

    const { loading, error, data } = useQuery(GET_CATEGORIES);

    const isClosed = (category) => closed.find((id) => id === category.id);

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    const onClick = (e) => {
        if (e.target.nodeName === "A" || e.target.nodeName === "SPAN") {
            if (window.innerWidth / 400 < 2) {
                onClose();
            }
        }
    };

    return (<div id="Content" className={(visible ? 'visible' : '')}>
        <header>
            <div className="searchBar">
                <input type="search" name="contentFilter" placeholder={t('content.filter')} value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <div className="close" onClick={() => onClose()}>✕</div>
        </header>
        <div className="con">
            <ul onClick={(e) => onClick(e)}>{data.categories.filter(category => category.recipes.length > 0).map(category => {
                const open = !isClosed(category);
                const recipes = filter === "" ? category.recipes : category.recipes.filter(recipe => recipe.name.toLowerCase().includes(filter.toLowerCase()));

                const number = recipes.length < category.recipes.length ? `(${recipes.length} / ${category.recipes.length})` : (!open ? `(${category.recipes.length})` : "");

                return <li key={category.id}>
                    <div onClick={() => {
                        if (!open) {
                            setClosed(closed.filter((id) => id !== category.id));
                        } else {
                            setClosed([...closed, category.id]);
                        }
                    }}>{(open ? "" : "❯ ")}{(category.id === "0" ? t('content.uncategorized') : category.name)} {number}</div>
                    {(!open ? <span /> : <ul>{recipes.map((recipe) =>
                        <li key={recipe.id}><NavLink to={`/recipes/${recipe.id}`} className={({ isActive }) => ((isActive ? "active" : ""))}><BoldedText text={recipe.name} filter={filter} /></NavLink></li>
                    )}</ul>)}
                </li>;
            })}
            </ul>
        </div>
    </div>)
}