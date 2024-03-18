import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from "react";
import Select from 'react-select';
import Creatable from 'react-select/creatable';
import { Loading, Error } from '../../ui/Utils.js';
import { Options, Option } from './Options.js';
import AutoResizeTextarea from '../../ui/AutoResizeTextarea.js';

const GET_DATA = gql`query GetData {
    units { id, name, description }
    ingredients {id, name }
    tags {id, name }
  }`;

const CREATE_INGREDIENT = gql`mutation CreateIngredient($ingredient: IngredientInput!) {
    createIngredient(ingredient: $ingredient) {
      id, name
    }
  }`;

const CREATE_TAG = gql`mutation CreateTag($tag: TagInput!) {
    createTag(tag: $tag) {
      id, name
    }
  }`;

const NEW_PREPARATION = { ingredient_id: null, unit_id: null, amount: 0, description: "", title: false };

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
            setUnits(data.units.map((unit) => ({ "value": unit.id, "label": unit.name })));
            setIngredients(data.ingredients.map((ingredient) => ({ "value": ingredient.id, "label": ingredient.name })));
            setTags(data.tags);
        }
    });

    if (loading || units === null || ingredients === null || tags === null) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div>
        <div>
            <label htmlFor="name">Name</label>
            <input name="title" id="name" type="text" value={recipe.name} placeholder="Name" onChange={(e) => update({ name: e.target.value })} />
        </div>

        <div>
            <div>
                <label htmlFor="portions">Portions</label> <input id="portions" type="number" value={`${recipe.portions}`} onChange={(e) => update({ ...recipe, portions: parseInt(e.target.value) })} min="1" step="1" />
            </div>
            <div>
                <input type="checkbox" id="vegan" defaultChecked={recipe.vegan} onClick={(e) => update({ vegan: e.target.checked })} />
                <label htmlFor="vegan">Vegan</label>

                <input type="checkbox" id="vegetarian" defaultChecked={recipe.vegetarian} onClick={(e) => update({ vegetarian: e.target.checked })} />
                <label htmlFor="vegetarian">Vegetarian</label>
            </div>
        </div>


        <div>
            <label htmlFor="description">Beschreibung:</label>
            <AutoResizeTextarea name="description" id="description" value={recipe.description} placeholder="Beschreibung"
                onChange={(e) => update({ description: e.target.value })} />
        </div>

        <div>
            <label htmlFor="source">Quelle:</label>
            <input id="source" type="text" value={recipe.source} placeholder="Quelle"
                onChange={(e) => update({ source: e.target.value })} />
        </div>

        <div>
            <label htmlFor="tags">Tags</label>
            <Creatable id="tags"
                options={tags.map((t) => ({ value: t.id, label: t.name }))} isMulti={true}
                value={recipe.tags.map((t) => ({ value: t.id, label: t.name }))}

                onCreateOption={(e) => createTag({
                    variables: { tag: { name: e } },
                    onCompleted: (data) => {
                        setTags([...tags, data.createTag].sort((a, b) => a.name < b.name ? -1 : 1));
                        update({ tags: [...recipe.tags, { id: data.createTag.id, name: data.createTag.name }] });
                    }
                })}

                onChange={(e) => update({ tags: e === null ? [] : e.map(t => ({ id: t.value, name: t.label })) })} />
        </div>

        <div className="horizontalOverflow">
            <table className="table preparations">
                <thead>
                    <tr>
                        <th className="title">Title</th>
                        <th className="amount">Menge</th>
                        <th className="unit">Einheit</th>
                        <th className="ingredient">Zutat</th>
                        <th className="description">Beschreibung</th>
                        <th className="options"></th>
                    </tr>
                </thead>
                <tbody>
                    {recipe.preparations.map((step, key) => <tr key={`${step.id}+${step.step}+${key}`}>
                        <td className="title">
                            <input name={`title_${key}`} type="checkbox" defaultChecked={step.title}
                                onClick={(e) => update({
                                    preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, title: e.target.checked } : p))
                                })} />
                        </td>
                        <td className="amount">
                            <input disabled={step.title} name={`amount_${key}`} type="number" value={step.amount} min="0" onChange={(e) => update({
                                preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, amount: e.target.value } : p))
                            })} />
                        </td>
                        <td className="unit">
                            <Select options={units} isDisabled={step.title} isClearable={true}
                                value={{ label: (units.length > 0 && step.unit_id ? units.find((u) => u.value === step.unit_id).label : "") }}
                                onChange={(e) => update({
                                    preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, unit_id: e === null ? null : e.value } : p))
                                })} />
                        </td>
                        <td className="ingredient">
                            <Creatable isDisabled={step.title}
                                options={ingredients}
                                isClearable={true}
                                value={{ label: (step.ingredient_id ? ingredients.find((u) => u.value === step.ingredient_id).label : (step.ingredient ? step.ingredient : "")) }}
                                onCreateOption={(e) => {
                                    console.log(e);
                                    createIngredient({
                                        variables: { ingredient: { name: e } },
                                        onCompleted: (data) => {
                                            setIngredients([...ingredients, { "value": data.createIngredient.id, "label": data.createIngredient.name }].sort((a, b) => a.label < b.label ? -1 : 1))

                                            update({
                                                preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, ingredient_id: data.createIngredient.id } : p))
                                            });
                                        }
                                    })
                                }}
                                onChange={(e) => update({
                                    preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, ingredient_id: e === null ? null : e.value } : p))
                                })} />
                        </td>
                        <td className="description">
                            <AutoResizeTextarea
                                name={`description_${key}`}
                                value={step.description ? step.description : ""}
                                onChange={(e) => update({
                                    preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, description: e.target.value } : p))
                                })} />
                        </td>
                        <td className="options">
                            <Options>
                                <Option onClick={() => update({
                                    preparations: recipe.preparations
                                        .filter((f, k) => k <= key)
                                        .concat([{ ...NEW_PREPARATION }])
                                        .concat(recipe.preparations.filter((f, k) => k > key))
                                        .map((e, k) => ({ ...e, step: k + 1 }))
                                })}>Add After</Option>
                                <Option onClick={() => update({
                                    preparations: recipe.preparations.filter((e, id) => key !== id).map((e, k) => ({ ...e, step: k + 1 }))
                                })}>Delete</Option>
                            </Options>
                        </td>
                    </tr>)}
                </tbody>
            </table>
        </div>

        <button name="addStep" className="btn btn-default" onClick={() => update({
            preparations: [...recipe.preparations,
            { ...NEW_PREPARATION, step: recipe.preparations.length + 2 }]
        })}>Add</button>
    </div>);
}