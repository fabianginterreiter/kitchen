import { Outlet, Link, NavLink } from "react-router-dom";
import { useState } from "react";
import './App.css';

export default function App() {
  const [menu, setMenu] = useState(false);

  return (
    <>
      <header id="title">
        <Link to="/recipes">Kitchen</Link>
        <div id="menu" onClick={() => setMenu(true)}>menu</div>
      </header>

      <nav id="nav" className={menu ? 'visible' : ''}>
        <button onClick={() => setMenu(false)}>Close</button>
        <ul onClick={() => setMenu(false)}>
          <li><NavLink to={`/recipes`} className={({ isActive }) => ((isActive ? "active" : ""))}>Rezepte</NavLink></li>
          <li><NavLink to={`/ingredients`} className={({ isActive }) => ((isActive ? "active" : ""))}>Zutaten</NavLink></li>
          <li><NavLink to={`/units`} className={({ isActive }) => ((isActive ? "active" : ""))}>Einheiten</NavLink></li>
          <li><NavLink to={`/tags`} className={({ isActive }) => ((isActive ? "active" : ""))}>Tags</NavLink></li>
        </ul>
      </nav>

      {(menu ? <div className="fullscreen visible" onClick={() => setMenu(false)}/> : <span />)}

      <div id="content">
        <Outlet />
      </div>
    </>
  );
}