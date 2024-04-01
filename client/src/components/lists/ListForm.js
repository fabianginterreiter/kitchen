import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import Select from 'react-select';
import { Options, Option } from '../recipes/Options.js';

const GET_LIST = gql`
query getData {
  recipes { id, name }
}`;


export default function List({ list, onChange, onClose, onSaveAndClose }) {

    const [recipes, setRecipes] = useState(null);
    const [title] = useState(list.id ? list.name : "Neue Liste");

    const { loading, error } = useQuery(GET_LIST, {
        onCompleted: (data) => {
            setRecipes(data.recipes.map((recipe) => ({ value: recipe.id, label: recipe.name })));
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
            entries: list.entries.map((entry) => ({
                id: entry.id,
                recipe_id: entry.recipe_id,
                portions: entry.portions,
                date: entry.date
            }))
        });
    }

    return (
        <div id="RecipeForm">
            <header>
                <div className="title">{title}</div>

                <button onClick={() => onClose()}>Abbrechen</button>
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
            </fieldset>

            <table className="table">
                <thead>
                    <tr>
                        <th>Rezept</th>
                        <th>Datum</th>
                        <th>Portionen</th>
                    </tr>
                </thead>
                <tbody>
                    {list.entries.map((entry, key) => <tr key={key}>
                        <td><input type="date" value={entry.date ? entry.date : ""} onChange={(e) => update({
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
                                        recipe_id: e.value
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