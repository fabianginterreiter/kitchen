import { Outlet, Link } from "react-router-dom";
import { useState } from "react";
import './App.css';
import Navigation from './components/Navigation.js';
import Content from "./components/Content";
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t, i18n } = useTranslation();

  const [menu, setMenu] = useState(false);
  const [content, setContent] = useState(false);

  return (
    <>
      <Content visible={content} onClose={() => setContent(false)} />
      <header id="title" className={content ? 'contentVisible' : ''}>
        <div id="contentOfTableButton" onClick={() => setContent(true)}>B</div>
        <Link to="/" className="title">{t('kitchen')}</Link>
        <div id="menu" onClick={() => setMenu(true)}>☰</div>
      </header>

      <Navigation visible={menu} onClose={() => setMenu(false)} />

      <div id="content" className={content ? 'contentVisible' : ''}>
        <Outlet />
      </div>
    </>
  );
}