import { useQuery, useMutation, gql } from '@apollo/client';
import { useState } from "react";
import Select from 'react-select';
import Creatable from 'react-select/creatable';
import { Loading, Error } from '../../ui/Utils.js';
import { Options, Option } from '../../ui/Options.js';
import AutoResizeTextarea from '../../ui/AutoResizeTextarea.js';
import { useTranslation } from 'react-i18next';

const GET_DATA = gql`query GetData {
    units { id, name, description }
    ingredients {id, name }
    tags {id, name }
    categories {id, name}
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

const Status = {
    NoChanges: 1,
    Changed: 2,
    Progress: 3,
    Done: 4
}

export default function RecipeForm({ recipe, onChange, onSave, onClose, onSaveAndClose }) {
    const { t } = useTranslation();

    const [units, setUnits] = useState(null);
    const [ingredients, setIngredients] = useState(null);
    const [tags, setTags] = useState(null);
    const [status, setStatus] = useState(Status.NoChanges);
    const [title, setTitle] = useState(recipe.id ? recipe.name : "Neues Rezept")

    const update = (update) => {
        setStatus(Status.Changed);
        onChange({ ...recipe, ...update });
    }

    const [createIngredient] = useMutation(CREATE_INGREDIENT);
    const [createTag] = useMutation(CREATE_TAG);

    const getRecipeObject = () => ({
        id: recipe.id,
        name: recipe.name,
        portions: recipe.portions,
        vegan: recipe.vegan,
        vegetarian: recipe.vegetarian,
        description: recipe.description,
        source: recipe.source,
        tags: recipe.tags.map((t) => ({ id: t.id, name: t.name })),
        category_id: recipe.category_id,
        preparations: recipe.preparations.map((p, k) => ({
            id: p.id,
            step: k + 1,
            title: p.title,
            ingredient_id: p.ingredient_id,
            unit_id: p.unit_id,
            amount: Number(p.amount),
            description: p.description
        }))
    });

    const { loading, error, data } = useQuery(GET_DATA, {
        onCompleted: (data) => {
            setUnits(data.units.map((unit) => ({ "value": unit.id, "label": unit.name })));
            setIngredients(data.ingredients.map((ingredient) => ({ "value": ingredient.id, "label": ingredient.name })));
            setTags(data.tags);
        }
    });

    if (loading || units === null || ingredients === null || tags === null) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div class="Fullscreen">

        <header>
            <div className="title">{title}</div>
            {(onClose ? <button onClick={() => onClose()}>{t('button.cancel')}</button> : <span />)}

            {(onSave ? <button disabled={status !== Status.Changed}
                className={(status === Status.Done ? 'button-success' : '')}
                onClick={() => {
                    setStatus(Status.Progress);
                    onSave(getRecipeObject(), () => {
                        setStatus(Status.Done);
                        setTitle(recipe.name);
                        setTimeout(() => setStatus(Status.NoChanges), 1000);
                    });
                }}>{t('button.save')}</button> : <span />)}

            {(onSaveAndClose ? <button
                onClick={() => {
                    if (status !== Status.Changed && onClose) {
                        onClose();
                    } else {
                        onSaveAndClose(getRecipeObject());
                    }
                }}>{t('button.saveAndClose')}</button> : <span />)}
        </header>

        <fieldset>
            <legend>{t('recipe.form.details')}</legend>

            <div>
                <label htmlFor="name">{t('recipe.form.name')}</label>
                <input name="title" className="title" id="name" type="text" value={recipe.name} placeholder={t('recipe.form.name')} onChange={(e) => update({ name: e.target.value })} />
            </div>

            <div>
                <label htmlFor="category">{t('recipe.form.category')}</label>
                <div>
                    <Select id="category" options={data.categories.map(c => ({ value: c.id, label: c.name }))} isClearable={true}
                        value={{ label: (recipe.category_id ? data.categories.find(f => f.id === recipe.category_id).name : "") }}
                        onChange={(e) => update({ category_id: (e ? e.value : null) })} />
                </div>
            </div>

            <div>
                <label htmlFor="tags">{t('recipe.form.tags')}</label>
                <div>
                    <Creatable id="tags"
                        options={tags.map((t) => ({ value: t.id, label: t.name }))} isMulti={true}
                        value={recipe.tags.map((t) => ({ value: t.id, label: t.name }))}

                        onCreateOption={(name) => createTag({
                            variables: { tag: { name } },
                            onCompleted: (data) => {
                                setTags([...tags, data.createTag].sort((a, b) => a.name < b.name ? -1 : 1));
                                update({ tags: [...recipe.tags, { id: data.createTag.id, name: data.createTag.name }] });
                            }
                        })}

                        onChange={(e) => update({ tags: e === null ? [] : e.map(t => ({ id: t.value, name: t.label })) })} />
                </div>
            </div>

            <div>
                <label htmlFor="description">{t('recipe.form.description')}</label>
                <div>
                    <AutoResizeTextarea name="description" id="description" value={recipe.description} placeholder={t('recipe.form.description')}
                        onChange={(e) => update({ description: e.target.value })} />
                </div>
            </div>


            <div>
                <label htmlFor="portions">{t('recipe.form.portions')}</label> <input id="portions" type="number" value={`${recipe.portions}`} onChange={(e) => update({ ...recipe, portions: parseInt(e.target.value) })} min="1" step="1" />
            </div>
            <div className="row">
                <div className="col50">
                    <input type="checkbox" id="vegan" defaultChecked={recipe.vegan} onClick={(e) => update({ vegan: e.target.checked })} />
                    <label htmlFor="vegan">{t('recipe.form.vegan')}</label>
                </div>
                <div className="col50">
                    <input type="checkbox" id="vegetarian" defaultChecked={recipe.vegetarian} onClick={(e) => update({ vegetarian: e.target.checked })} />
                    <label htmlFor="vegetarian">{t('recipe.form.vegetarian')}</label>
                </div>
            </div>


            <div>
                <label htmlFor="source">{t('recipe.form.source')}</label>
                <div>
                    <input id="source" type="text" value={recipe.source} placeholder={t('recipe.form.source')}
                        onChange={(e) => update({ source: e.target.value })} />
                </div>
            </div>
        </fieldset>


        <div className="overflow">
            <fieldset>
                <legend>{t('recipe.form.preparation')}</legend>

                {recipe.preparations.length > 0 ? <table className="preparations">
                    <thead>
                        <tr>
                            <th className="amount">{t('recipe.form.table.amount')}</th>
                            <th className="unit">{t('recipe.form.table.unit')}</th>
                            <th className="ingredient">{t('recipe.form.table.ingredient')}</th>
                            <th className="description">{t('recipe.form.table.description')}</th>
                            <th className="options"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipe.preparations.map((step, key) => <tr key={`${step.id}+${step.step}+${key}`} className={step.title ? "title" : ""}>
                            {!step.title && <>
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
                            </>}
                            <td className="description" colSpan={step.title ? 4 : 1}>
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
                                        preparations: recipe.preparations.map((p, k) => (k === key ? { ...p, title: !step.title } : p))
                                    })}>{t('recipe.form.table.options.title')}</Option>
                                    <Option onClick={() => update({
                                        preparations: recipe.preparations
                                            .filter((f, k) => k < key)
                                            .concat([{ ...NEW_PREPARATION }])
                                            .concat(recipe.preparations.filter((f, k) => k >= key))
                                            .map((e, k) => ({ ...e, step: k + 1 }))
                                    })}>{t('recipe.form.table.options.addBefore')}</Option>
                                    <Option onClick={() => update({
                                        preparations: recipe.preparations
                                            .filter((f, k) => k <= key)
                                            .concat([{ ...NEW_PREPARATION }])
                                            .concat(recipe.preparations.filter((f, k) => k > key))
                                            .map((e, k) => ({ ...e, step: k + 1 }))
                                    })}>{t('recipe.form.table.options.addAfter')}</Option>
                                    <Option onClick={() => update({
                                        preparations: recipe.preparations.filter((e, id) => key !== id).map((e, k) => ({ ...e, step: k + 1 }))
                                    })}>{t('recipe.form.table.options.delete')}</Option>
                                </Options>
                            </td>
                        </tr>)}
                    </tbody>
                </table> : <button name="addStep" className="btn btn-default" onClick={() => update({
                    preparations: [...recipe.preparations,
                    { ...NEW_PREPARATION, step: recipe.preparations.length + 2 }]
                })}>{t('recipe.form.preparations.first')}</button>}
                
                {recipe.preparations.length > 0 &&
                    <button name="addStep" className="btn btn-default" onClick={() => update({
                        preparations: [...recipe.preparations,
                        { ...NEW_PREPARATION, step: recipe.preparations.length + 2 }]
                    })}>{t('recipe.form.preparations.add')}</button>}
            </fieldset>
        </div>
    </div>);
}