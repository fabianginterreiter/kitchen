import { useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

export default function useDialog() {
    const { t } = useTranslation();

    const promiseRef = useRef({ resolve: null, reject: null })
    const [jsx, setJsx] = useState(<></>);

    const resolve = (result) => {
        promiseRef.current.resolve(result);
        setJsx(<></>);
    }

    const confirm = (message) => {
        setJsx(<div>
            <div className="background">
                <div className="fullscreen" />
                <div className="Modal">
                    <header>{t('Dialog.confirm.title')}</header>
                    <div className="content">{message}</div>
                    <footer>
                        <button onClick={() => resolve(false)}>{t('Dialog.confirm.no')}</button>
                        <button onClick={() => resolve(true)}>{t('Dialog.confirm.yes')}</button>
                    </footer>
                </div>
            </div>
        </div >)

        return new Promise((resolve, reject) => {
            promiseRef.current = { resolve, reject }
        });
    }

    const alert = (message) => {
        setJsx(<div>
            <div className="background">
                <div className="fullscreen" />
                <div className="Modal">
                    <header>{t('Dialog.alert.title')}</header>
                    <div className="content">{message}</div>
                    <footer>
                        <button onClick={() => resolve(true)}>{t('Dialog.alert.ok')}</button>
                    </footer>
                </div>
            </div>
        </div >)

        return new Promise((resolve, reject) => {
            promiseRef.current = { resolve, reject }
        });
    }

    return {
        render: jsx,
        confirm,
        alert
    }
}