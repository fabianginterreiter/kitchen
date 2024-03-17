import { Outlet, Link } from "react-router-dom";
import { useState } from "react";
import './App.css';
import Navigation from './components/Navigation.js';

export default function App() {
  const [menu, setMenu] = useState(false);

  return (
    <>
      <header id="title">
        <Link to="/recipes">Kitchen</Link>
        <div id="menu" onClick={() => setMenu(true)}>☰</div>
      </header>

      <Navigation visible={menu} onClose={() => setMenu(false)} />

      <div id="content">
        <Outlet />
      </div>
    </>
  );
}