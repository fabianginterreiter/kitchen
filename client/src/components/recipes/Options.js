import { useState } from "react";

export function Option({ children }) {
    return (<li>{children}</li>);
}

export function Options({ children }) {
    const [open, setOpen] = useState(false);

    return (<div className="Options">
        <div className="button" onClick={() => setOpen(!open)}>☰</div>
        {(open ? <div className="menu" onClick={() => setOpen(false)}>
            <ul>{children}</ul>
        </div> : <span />)}
        {(open ? <div className="OptionsFullscreen" onClick={() => setOpen(false)} /> : <span />)}
    </div>);
}