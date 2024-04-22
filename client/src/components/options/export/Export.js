import { useState } from "react";
import { useTranslation } from 'react-i18next';

export default function Export() {
    const { t } = useTranslation();
    const [file, setFile] = useState("");

    const upload = () => {
        console.log("Uploading file...");

        // You can write the URL of your server or any other endpoint used for file upload
        fetch("/api/import", {
            method: "POST",
            body: file,
        }).then(response => console.log(response));
    }

    return (<div>
        <h1>{t('options.importexport')}</h1>
        <div>Export: <a href="/api/export">Export</a></div>

        <div>import<input type="file" onChange={(e) => setFile(e.target.files[0])} /></div>
        <div>{file && (
            <section>
                File details:
                <ul>
                    <li>Name: {file.name}</li>
                    <li>Type: {file.type}</li>
                    <li>Size: {file.size} bytes</li>
                </ul>
                <button onClick={() => upload()}>Upload</button>
            </section>

        )}</div>
    </div>);
}