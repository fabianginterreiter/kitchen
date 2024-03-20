import { Link } from "react-router-dom";
import './Tags.css';

export default function Tags({ tags }) {
    return (<ul className="Tags">{tags.map(t => (<li key={t.id}><Link to={`/tags/${t.id}`}>#{t.name}</Link></li>))}</ul>);
}