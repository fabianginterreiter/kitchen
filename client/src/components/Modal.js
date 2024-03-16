import './Modal.css';

export default function Modal({ onClose, onSave, visible, title, children }) {
    return (visible ? <div className="fullscreen">
        <div className="background" onClick={() => onClose()} />
        <div className="modal">
            <header>{title}</header>
            <div className="content">{children}</div>
            <footer>
                <button onClick={() => onClose()}>Abbrechen</button>
                <button onClick={() => onSave()}>Save</button>
            </footer>
        </div>
    </div> : <span />);
}