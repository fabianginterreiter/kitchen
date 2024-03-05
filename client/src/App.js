import { Outlet, Link, NavLink } from "react-router-dom";
import './App.css';

export default function App() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary" id="header">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Kitchen</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to={`/recipes`} className={({ isActive }) => ((isActive ? "active" : "") + " nav-link")} aria-current="page">Rezepte</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`/ingredients`} className={({ isActive }) => ((isActive ? "active" : "") + " nav-link")} aria-current="page">Zutaten</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={`/units`} className={({ isActive }) => ((isActive ? "active" : "") + " nav-link")} aria-current="page">Einheiten</NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <Outlet />
      </div>
    </div>
  );
}