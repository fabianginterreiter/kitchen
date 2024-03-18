import './Modal.css';

export default function Modal({ onClose, onSave, title, children }) {
    return (<div className="background">
        <div className="fullscreen" onClick={() => onClose()} />
        <div className="modal">
            <header>{title}</header>
            <div className="content">{children}</div>
            <footer>
                <button onClick={() => onClose()}>Abbrechen</button>
                <button onClick={() => onSave()}>Save</button>
            </footer>
        </div>
    </div>);
}