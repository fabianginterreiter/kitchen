import { useQuery, useMutation, gql } from '@apollo/client';
import { Link, useParams } from 'react-router-dom';
import { useState, useProps } from "react";
// https://react-select.com/
import Select from 'react-select';
import Creatable, { useCreatable } from 'react-select/creatable';
import { Loading, Error } from './Utils.js';

const GET_DATA = gql`query GetData {
    units { id, name, description }
    ingredients {id, name }
    tags {id, name }
  }`;

const CREATE_INGREDIENT = gql`mutation CreateIngredient($name: String!) {
    createIngredient(name: $name) {
      id, name
    }
  }`;

const CREATE_TAG = gql`mutation CreateTag($tag: TagInput!) {
    createTag(tag: $tag) {
      id, name
    }
  }`;

const NEW_PREPARATION = { ingredient_id: 0, unit_id: 0, amount: 0, description: "", title: false };

export default function RecipeForm(args) {
    const recipe = args.recipe;

    const [units, setUnits] = useState(null);
    const [ingredients, setIngredients] = useState(null);
    const [tags, setTags] = useState(null);

    const update = (update) => {
        args.onChange({ ...recipe, ...update });
    }

    const [createIngredient] = useMutation(CREATE_INGREDIENT);
    const [createTag] = useMutation(CREATE_TAG);

    const { loading, error } = useQuery(GET_DATA, {
        onCompleted: (data) => {
            setUnits([{ value: "0", label: "" }].concat(data.units.map((unit) => ({ "value": unit.id, "label": unit.name }))));
            setIngredients([{ value: "0", label: " " }].concat(data.ingredients.map((ingredient) => ({ "value": ingredient.id, "label": ingredient.name }))));
            setTags(data.tags);
        }
    });

    const changeUnit = (key, e) => {
        update({
            preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, unit_id: parseInt(e.value) } : p))
        });
    };


    const changeIngredient = (key, e) => {
        if (e.__isNew__) {
            createIngredient({
                variables: { ingredient: { name: e.label } },
                onCompleted: (data) => {
                    setIngredients([...ingredients, { "value": data.createIngredient.id, "label": data.createIngredient.name }].sort((a, b) => a.label < b.label ? -1 : 1))

                    update({
                        preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, ingredient_id: parseInt(data.createIngredient.id) } : p))
                    });
                }
            });
        } else {
            update({
                preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, ingredient_id: parseInt(e.value) } : p))
            })
        }
    };

    if (loading || units === null || ingredients === null || tags === null) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div>
        <div className="mb-3">
            <label htmlFor="name" className="form-label">Name:</label>
            <input name="title" id="name" className="form-control" type="text" value={recipe.name} onChange={(e) => update({ name: e.target.value })} />
        </div>

        <div className="mb-9">
            <div className="col-3">
                Portions: <input name="portions" className="form-control" type="number" value={`${recipe.portions}`} onChange={(e) => update({ ...recipe, portions: parseInt(e.target.value) })} min="1" step="1" />
            </div>
            <div className="col-3">
                <input type="checkbox" defaultChecked={recipe.vegan} onClick={(e) => update({ vegan: e.target.checked })} /> Vegan</div>
            <div className="col-3"> <input type="checkbox" defaultChecked={recipe.vegetarian} onClick={(e) => update({ vegetarian: e.target.checked })} /> Vegetarian</div>
        </div>


        <div className="mb-3">
            <label htmlFor="description" className="form-label">Beschreibung:</label>
            <textarea name="description" id="description" className="form-control" value={recipe.description} placeholder="Beschreibung"
                onChange={(e) => update({ description: e.target.value })} />
        </div>

        <div className="mb-3">
            <label htmlFor="source" className="form-label">Quelle:</label>
            <input name="source" id="source" className="form-control" type="text" value={recipe.source} placeholder="Quelle"
                onChange={(e) => update({ source: e.target.value })} />
        </div>

        <div className="mb-3">
            <Creatable
                options={tags.map((t) => ({ value: t.id, label: t.name }))} isMulti={true}
                value={recipe.tags.map((t) => ({ value: t.id, label: t.name }))}

                onCreateOption={(e) => {
                    createTag({
                        variables: { tag: { name: e } },
                        onCompleted: (data) => {
                            setTags([...tags, data.createTag].sort((a, b) => a.name < b.name ? -1 : 1));
                            update({ tags: [...recipe.tags, { id: data.createTag.id, name: data.createTag.name }] });
                        }
                    });
                }}

                onChange={(e) => update({ tags: e.map(t => ({ id: t.value, name: t.label })) })} />
        </div>

        <table className="table table-striped">
            <thead>
                <tr>
                    <th className="col-1"></th>
                    <th className="col-1">Menge</th>
                    <th className="col-1">Einheit</th>
                    <th className="col-2">Zutat</th>
                    <th className="col-6">Beschreibung</th>
                    <th className="col-2"></th>
                </tr>
            </thead>
            <tbody>
                {recipe.preparations.map((step, key) => <tr key={`${step.id}+${step.step}+${key}`}>
                    <td>
                        <input name={`title_${key}`} type="checkbox" defaultChecked={step.title}
                            onClick={(e) => update({
                                preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, title: e.target.checked } : p))
                            })} />
                    </td>
                    <td>
                        <input disabled={step.title} name={`amount_${key}`} type="number" className="form-control" value={step.amount} min="0" onChange={(e) => update({
                            preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, amount: e.target.value } : p))
                        })} />
                    </td>
                    <td>
                        <Select options={units} isDisabled={step.title}
                            defaultValue={{ label: (units.length > 0 && step.unit_id > 0 ? units.find((u) => u.value == step.unit_id).label : "") }}
                            onChange={(e) => changeUnit(key, e)} />
                    </td>
                    <td>
                        <Creatable isDisabled={step.title}
                            options={ingredients}
                            defaultValue={{ label: (step.ingredient_id > 0 ? ingredients.find((u) => u.value == step.ingredient_id).label : (step.ingredient ? step.ingredient : "")) }}
                            onChange={(e) => changeIngredient(key, e)} />
                    </td>
                    <td>
                        <textarea
                            name={`description_${key}`}
                            value={step.description ? step.description : ""}
                            className="form-control"
                            onChange={(e) => update({
                                preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, description: e.target.value } : p))
                            })} />
                    </td>
                    <td>
                        <div className="dropdown">
                            <button className="btn btn-default dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="bi bi-list" />
                            </button>
                            <ul className="dropdown-menu">
                                <li><button name={`addAfter_${key}`} onClick={() => update({
                                    preparations: recipe.preparations
                                        .filter((f, k) => k <= key)
                                        .concat([{ ...NEW_PREPARATION }])
                                        .concat(recipe.preparations.filter((f, k) => k > key))
                                        .map((e, k) => ({ ...e, step: k + 1 }))
                                })} className="dropdown-item">Add After</button></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button name={`removeStep_${key}`} onClick={() => update({
                                    preparations: recipe.preparations.filter((e, id) => key != id).map((e, k) => ({ ...e, step: k + 1 }))
                                })} className="dropdown-item">Delete</button></li>
                                <li><a className="dropdown-item" href="#">Löschen</a></li>
                            </ul>
                        </div>
                    </td>
                </tr>)}
            </tbody>
        </table>

        <button name="addStep" className="btn btn-default" onClick={() => update({
            preparations: [...recipe.preparations,
            { ...NEW_PREPARATION, step: recipe.preparations.length + 2 }]
        })}>Add</button>
    </div>);
}