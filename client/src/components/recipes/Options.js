import { useState } from "react";
import { Link } from "react-router-dom";
import './Options.css';

export function Option({ children, onClick, linkTo }) {
    return (<li>
        <Link to={linkTo} onClick={() => { if (onClick) { onClick() } }}>{children}</Link>
    </li>);
}

export function Options({ children, size }) {
    const [open, setOpen] = useState(false);

    return (<div className="Options">
        <div className={`button ` + (size === "large" ? "large" : "medium")} onClick={() => setOpen(!open)}>☰</div>
        {(open ? <div className={`menu ` + (size === "large" ? "large" : "medium")} onClick={() => setOpen(false)}>
            <ul>{children}</ul>
        </div> : <span />)}
        {(open ? <div className="OptionsFullscreen" onClick={() => setOpen(false)} /> : <span />)}
    </div>);
}