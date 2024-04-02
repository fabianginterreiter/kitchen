import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import Select from 'react-select';
import { Options, Option } from '../recipes/Options.js';

const GET_LIST = gql`
query getData {
  recipes { id, name, portions }
}`;


export default function List({ list, onChange, onClose, onSave, onSaveAndClose }) {

    const [recipes, setRecipes] = useState(null);
    const [title] = useState(list.id ? list.name : "Neue Liste");

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
            startDate: list.startDate,
            endDate: list.endDate,
            closed: list.closed,
            entries: list.entries.filter((entry) => entry.recipe_id).map((entry) => ({
                id: entry.id,
                recipe_id: entry.recipe_id,
                portions: entry.portions,
                date: entry.date
            }))
        });
    }

    const getDayName = (day) => {
        switch (day) {
            case 0: return 'Sonntag';
            case 1: return 'Montag';
            case 2: return 'Dienstag';
            case 3: return 'Mittwoch';
            case 4: return 'Donnerstag';
            case 5: return 'Freitag';
            case 6: return 'Samstag';
            default: return '???';
        }
    }

    const getWorkday = (date) => {
        if (!date) {
            return <span />
        }
        const day = new Date(date).getDay();

        return <span>{getDayName(day)}</span>;
    }

    return (
        <div id="RecipeForm">
            <header>
                <div className="title">{title}</div>

                <button onClick={() => onClose()}>Abbrechen</button>
                <button onClick={() => {
                    onSave(getListObject())
                }}>Speichern</button>
                <button onClick={() => {
                    onSaveAndClose(getListObject())
                }}>Speichern & Schließen</button>
            </header>

            <div>
                <label htmlFor="name">Name</label>
                <input name="title" className="title" id="name" type="text" value={list.name} placeholder="Name" onChange={(e) => update({ name: e.target.value })} />
            </div>

            <fieldset>
                <legend>Eigenschaften</legend>
                <div>
                    <input type="checkbox" value={list.closed}
                        id="closed" onChange={(e) => update({ closed: e.target.checked })} />
                    <label htmlFor="closed">Closed</label>
                </div>
                <div>
                    <input type="date" value={list.startDate ? list.startDate : ""} onChange={(e) => update({ ...list, startDate: e.target.value.length > 0 ? e.target.value : null })} />
                </div>
                <div>
                    <input type="date" value={list.endDate ? list.endDate : ""} onChange={(e) => update({ ...list, endDate: e.target.value.length > 0 ? e.target.value : null })} />
                </div>
            </fieldset>

            <table className="table">
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Rezept</th>
                        <th>Portionen</th>
                    </tr>
                </thead>
                <tbody>
                    {list.entries.map((entry, key) => <tr key={key}>
                        <td>
                            {getWorkday(entry.date)}
                            <input type="date" value={entry.date ? entry.date : ""} onChange={(e) => update({
                                entries: list.entries.map((en, k) => (k === key ? {
                                    ...en,
                                    date: e.target.value.length > 0 ? e.target.value : null
                                } : en))
                            })} /></td>
                        <td>
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
                        <td>
                            <input type="number" value={entry.portions} min="1" step="1" onChange={(e) => update({
                                entries: list.entries.map((en, k) => (k === key ? {
                                    ...en,
                                    portions: parseInt(e.target.value)
                                } : en))
                            })} />
                        </td>
                        <td>
                            <Options>
                                <Option onClick={() => update({
                                    entries: list.entries.filter((e, id) => key !== id)
                                })}>Delete</Option>
                            </Options>
                        </td>
                    </tr>)}
                </tbody>
            </table>

            <button onClick={() => update({
                entries: [...list.entries, {
                    id: null,
                    portions: 2,
                    date: null,
                    recipe_id: null
                }]
            })}>Add</button>
        </div >
    );
};