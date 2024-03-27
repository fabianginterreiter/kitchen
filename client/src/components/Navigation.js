import { NavLink } from "react-router-dom";
import './Navigation.css';

export default function Navigation({ visible, onClose }) {
    return (<div>
        <nav id="nav" className={visible ? 'visible' : ''}>
            <header><div id="close" onClick={() => onClose()}>✕</div></header>
            <ul onClick={() => onClose()}>
                <li><NavLink to={`/recipes`} className={({ isActive }) => ((isActive ? "active" : ""))}>Rezepte</NavLink></li>
                <li><NavLink to={`/categories`} className={({ isActive }) => ((isActive ? "active" : ""))}>Kategorien</NavLink></li>
                <li><NavLink to={`/ingredients`} className={({ isActive }) => ((isActive ? "active" : ""))}>Zutaten</NavLink></li>
                <li><NavLink to={`/tags`} className={({ isActive }) => ((isActive ? "active" : ""))}>Tags</NavLink></li>
                <li className="header">Optionen</li>
                <li><NavLink to={`/options/units`} className={({ isActive }) => ((isActive ? "active" : ""))}>Einheiten</NavLink></li>
                <li><NavLink to={`/options/categories`} className={({ isActive }) => ((isActive ? "active" : ""))}>Kategorien</NavLink></li>
                <li><NavLink to={`/options/ingredients`} className={({ isActive }) => ((isActive ? "active" : ""))}>Zutaten</NavLink></li>
                <li><NavLink to={`/options/ingredients/categories`} className={({ isActive }) => ((isActive ? "active" : ""))}>Zutaten Kategorien</NavLink></li>
                <li><NavLink to={`/options/export`} className={({ isActive }) => ((isActive ? "active" : ""))}>Import & Export</NavLink></li>
            </ul>
        </nav>
        {(visible ? <div className="fullscreen" onClick={() => onClose()} /> : <span />)}
    </div>);
}