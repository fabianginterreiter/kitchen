import './Modal.css';
import { useTranslation } from 'react-i18next';

export default function Modal({ onClose, onSave, title, children }) {
    const { t } = useTranslation();

    return (<div className="background">
        <div className="fullscreen" onClick={() => onClose()} />
        <div className="Modal">
            <header>{title}</header>
            <div className="content">{children}</div>
            <footer>
                <button onClick={() => onClose()}>{t('button.cancel')}</button>
                <button onClick={() => onSave()}>{t('button.save')}</button>
            </footer>
        </div>
    </div>);
}