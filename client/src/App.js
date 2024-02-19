import './App.css';

import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div className="App">
      <Link to={`/recipes`}>Rezepte</Link>
      <div id="detail">
        <Outlet />
      </div>
    </div>
  );
}