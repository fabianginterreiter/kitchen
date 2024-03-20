import './AutoResizeTextarea.css';

export default function AutoResizeTextarea({ value, onChange, placeholder, name, id }) {
    return (<div className="AutoResizeTextarea">
        <div>{value}\n</div>
        <textarea value={value} onChange={(e) => onChange(e)} placeholder={placeholder} name={name} id={id} />
    </div>)
}