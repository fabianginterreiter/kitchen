import { NavLink } from "react-router-dom";
import './Navigation.css';

export default function Navigation({ visible, onClose }) {
    return (<div>
        <nav id="nav" className={visible ? 'visible' : ''}>
            <header><div id="close" onClick={() => onClose()}>✕</div></header>
            <ul onClick={() => onClose()}>
                <li><NavLink to={`/recipes`} className={({ isActive }) => ((isActive ? "active" : ""))} end>Rezepte</NavLink></li>
                <li><NavLink to={`/categories`} className={({ isActive }) => ((isActive ? "active" : ""))} end>Kategorien</NavLink></li>
                <li><NavLink to={`/ingredients`} className={({ isActive }) => ((isActive ? "active" : ""))} end>Zutaten</NavLink></li>
                <li><NavLink to={`/tags`} className={({ isActive }) => ((isActive ? "active" : ""))} end>Tags</NavLink></li>
                <li className="header">Optionen</li>
                <li><NavLink to={`/options/units`} className={({ isActive }) => ((isActive ? "active" : ""))} end>Einheiten</NavLink></li>
                <li><NavLink to={`/options/categories`} className={({ isActive }) => ((isActive ? "active" : ""))} end>Kategorien</NavLink></li>
                <li><NavLink to={`/options/ingredients`} className={({ isActive }) => ((isActive ? "active" : ""))} end>Zutaten</NavLink></li>
                <li><NavLink to={`/options/ingredients/categories`} className={({ isActive }) => ((isActive ? "active" : ""))} end>Zutaten Kategorien</NavLink></li>
                <li><NavLink to={`/options/export`} className={({ isActive }) => ((isActive ? "active" : ""))} end>Import & Export</NavLink></li>
            </ul>
        </nav>
        {(visible ? <div className="fullscreen" onClick={() => onClose()} /> : <span />)}
    </div>);
}