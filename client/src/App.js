import { Outlet, Link, NavLink } from "react-router-dom";
import './App.css';

export default function App() {
  return (
    <>
      <header>
        <div id="title"><Link to="/">Kitchen</Link></div>

        <nav>
          <ul>
            <li><NavLink to={`/recipes`} className={({ isActive }) => ((isActive ? "active" : ""))}>Rezepte</NavLink></li>
            <li><NavLink to={`/ingredients`} className={({ isActive }) => ((isActive ? "active" : ""))}>Zutaten</NavLink></li>
            <li><NavLink to={`/units`} className={({ isActive }) => ((isActive ? "active" : ""))}>Einheiten</NavLink></li>
            <li><NavLink to={`/tags`} className={({ isActive }) => ((isActive ? "active" : ""))}>Tags</NavLink></li>
          </ul>
        </nav>
      </header>

      <div id="content">
        <Outlet />
      </div>
    </>
  );
}