import { NavLink } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import './Navigation.css';

export default function Navigation({ visible, onClose }) {
    const { t } = useTranslation();

    return (<div>
        <nav id="nav" className={visible ? 'visible' : ''}>
            <header><div id="close" onClick={() => onClose()}>✕</div></header>
            <ul onClick={() => onClose()}>
                <li><NavLink to={'/recipes/create'}>{t('menu.createRecipe')}</NavLink></li>
                <li><NavLink to={`/lists/create`} className={({ isActive }) => ((isActive ? "active" : ""))} end>{t('menu.createList')}</NavLink></li>
                <li className="header"></li>
                <li><NavLink to={`/recipes`} className={({ isActive }) => ((isActive ? "active" : ""))} end>{t('recipes')}</NavLink></li>
                <li><NavLink to={`/categories`} className={({ isActive }) => ((isActive ? "active" : ""))} end>{t('categories')}</NavLink></li>
                <li><NavLink to={`/ingredients`} className={({ isActive }) => ((isActive ? "active" : ""))} end>{t('ingredients')}</NavLink></li>
                <li><NavLink to={`/tags`} className={({ isActive }) => ((isActive ? "active" : ""))} end>{t('tags')}</NavLink></li>
                <li><NavLink to={`/lists`} className={({ isActive }) => ((isActive ? "active" : ""))} end>{t('lists')}</NavLink></li>
                <li className="header">{t('options')}</li>
                <li><NavLink to={`/options/units`} className={({ isActive }) => ((isActive ? "active" : ""))} end>{t('options.units')}</NavLink></li>
                <li><NavLink to={`/options/categories`} className={({ isActive }) => ((isActive ? "active" : ""))} end>{t('options.categories')}</NavLink></li>
                <li><NavLink to={`/options/ingredients`} className={({ isActive }) => ((isActive ? "active" : ""))} end>{t('options.ingredients')}</NavLink></li>
                <li><NavLink to={`/options/ingredients/categories`} className={({ isActive }) => ((isActive ? "active" : ""))} end>{t('options.ingredients.categories')}</NavLink></li>
                <li><NavLink to={`/options/tags`} className={({ isActive }) => ((isActive ? "active" : ""))} end>{t('options.tags')}</NavLink></li>
                <li><NavLink to={`/options/export`} className={({ isActive }) => ((isActive ? "active" : ""))} end>{t('options.importexport')}</NavLink></li>
            </ul>
        </nav>
        {(visible ? <div className="fullscreen" onClick={() => onClose()} /> : <span />)}
    </div>);
}