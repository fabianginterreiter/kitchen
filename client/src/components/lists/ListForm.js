import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import Select from 'react-select';
import { Options, Option } from '../../ui/Options.js';
import AutoResizeTextarea from "../../ui/AutoResizeTextarea.js";
import './List.css';

const GET_LIST = gql`
query getData { recipes { id, name, portions } }`;

const Status = {
    NoChanges: 1,
    Changed: 2,
    Progress: 3,
    Done: 4
}

export default function List({ list, onChange, onClose, onSave, onSaveAndClose }) {

    const [recipes, setRecipes] = useState(null);
    const [title, setTitle] = useState(list.id ? list.name : "Neue Liste");
    const [status, setStatus] = useState(Status.NoChanges);

    const { loading, error } = useQuery(GET_LIST, {
        onCompleted: (data) => {
            setRecipes(data.recipes.map((recipe) => ({ value: recipe.id, label: recipe.name, portions: recipe.portions })));
        }
    });

    if (loading || !recipes) return <Loading />;
    if (error) return <Error message={error.message} />;

    const update = (value) => {
        onChange({ ...list, ...value });
    };

    const getListObject = () => {
        return ({
            id: list.id,
            name: list.name,
            description: list.description,
            closed: list.closed,
            entries: list.entries.filter((entry) => entry.recipe_id).map((entry) => ({
                id: entry.id,
                recipe_id: entry.recipe_id,
                portions: entry.portions,
                date: entry.date
            }))
        });
    }

    return (<div id="ListForm" class="Fullscreen">
        <header>
            <div className="title">{title}</div>

            <button onClick={() => onClose()}>Abbrechen</button>
            <button className={(status === Status.Done ? 'button-success' : '')}
                onClick={() => {
                    setStatus(Status.Progress);
                    onSave(getListObject(), () => {
                        setStatus(Status.Done);
                        setTitle(list.name);
                        setTimeout(() => setStatus(Status.NoChanges), 1000);
                    });
                }}>Speichern</button>
            <button onClick={() => {
                onSaveAndClose(getListObject())
            }}>Speichern & Schließen</button>
        </header>

        <fieldset>
            <legend>Liste</legend>
            <div>
                <input name="title" className="title" type="text" value={list.name} placeholder="Name" onChange={(e) => update({ name: e.target.value })} />
            </div>

            {list.id && <div>
                <input type="checkbox" checked={list.closed}
                    id="closed" onChange={(e) => update({ closed: e.target.checked })} />
                <label htmlFor="closed">Abgeschlossen</label>
            </div>}

            <div>
                <AutoResizeTextarea placeholder="Beschreibung" value={list.description} onChange={(e) => update({ description: e.target.value })} />
            </div>
        </fieldset>

        <div className='overflow'>
            <fieldset>
                <legend>Rezepte</legend>

                {list.entries.length > 0 ? <table className="table">
                    <thead>
                        <tr>
                            <th>Datum</th>
                            <th>Rezept</th>
                            <th>Portionen</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.entries.map((entry, key) => <tr key={key}>
                            <td className="date">
                                <input type="date" value={entry.date ? entry.date : ""} onChange={(e) => update({
                                    entries: list.entries.map((en, k) => (k === key ? {
                                        ...en,
                                        date: e.target.value.length > 0 ? e.target.value : null
                                    } : en))
                                })} /></td>
                            <td className="recipe">
                                <Select
                                    value={entry.recipe_id ? recipes.find((r) => r.value === entry.recipe_id) : null}
                                    options={recipes}
                                    onChange={(e) => update({
                                        entries: list.entries.map((en, k) => (k === key ? {
                                            ...en,
                                            recipe_id: e.value,
                                            portions: e.portions
                                        } : en))
                                    })} />
                            </td>
                            <td className="portions">
                                <input type="number" value={entry.portions} min="1" step="1" onChange={(e) => update({
                                    entries: list.entries.map((en, k) => (k === key ? {
                                        ...en,
                                        portions: parseInt(e.target.value)
                                    } : en))
                                })} />
                            </td>
                            <td className="options">
                                <Options>
                                    <Option onClick={() => update({
                                        entries: list.entries.filter((e, id) => key !== id)
                                    })}>Delete</Option>
                                </Options>
                            </td>
                        </tr>)}
                    </tbody>
                </table> : <button onClick={() => update({
                    entries: [...list.entries, {
                        id: null,
                        portions: 1,
                        date: null,
                        recipe_id: null
                    }]
                })}>Füge ein erstes Gericht hinzufügen</button>}

                {list.entries.length > 0 && <button onClick={() => update({
                    entries: [...list.entries, {
                        id: null,
                        portions: 1,
                        date: null,
                        recipe_id: null
                    }]
                })}>Weiteres Gericht hinzufügen</button>}
            </fieldset>
        </div>
    </div >);
};