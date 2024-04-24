import { Link } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../../ui/Utils.js';
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import useDialog from '../../../ui/Dialog.js';
import Modal from '../../../ui/Modal.js';
import Select from 'react-select';

const GET_INGREDIENTS = gql`query GetIngredients {
    ingredients { id, name, usages, category_id }
    categories: ingredientsCategories { id,name }
  }`;

const CREATE_INGREDIENT = gql`mutation Mutation($ingredient: IngredientInput) {
    createIngredient(ingredient: $ingredient) { id, name, usages, category_id }
  }`;

const UPDATE_INGREDIENT = gql`mutation Mutation($ingredient: IngredientInput) {
    updateIngredient(ingredient: $ingredient) { id, name, usages, category_id }
  }`;

const DELETE_INGREDIENT = gql`mutation Mutation($ingredient: IngredientInput) {
    deleteIngredient(ingredient: $ingredient)
}`;

export default function Ingredients() {
    const { t } = useTranslation();

    const dialog = useDialog();

    const [ingredient, setIngredient] = useState(null);
    const [ingredients, setIngredients] = useState([]);

    const [createIngredient] = useMutation(CREATE_INGREDIENT);
    const [updateIngredient] = useMutation(UPDATE_INGREDIENT);
    const [deleteIngredient] = useMutation(DELETE_INGREDIENT);

    const { loading, error, data } = useQuery(GET_INGREDIENTS, {
        onCompleted: (data) => setIngredients(data.ingredients)
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div>
        <h1>{t('options.ingredients')}</h1>

        {dialog.render}

        {ingredient ? <Modal visible={ingredient !== null} onClose={() => setIngredient(null)} onSave={() => {
            if (ingredient.id) {
                updateIngredient({
                    variables: { ingredient: { id: ingredient.id, name: ingredient.name, category_id: ingredient.category_id } },
                    onCompleted: (data) => {
                        setIngredients(ingredients.map((u) => (u.id === data.updateIngredient.id) ? data.updateIngredient : u));
                        setIngredient(null);
                    }
                })
            } else {
                createIngredient({
                    variables: {
                        ingredient
                    },
                    onCompleted: (data) => {
                        setIngredients([...ingredients, data.createIngredient]);
                        setIngredient(null);
                    }
                })
            }

            setIngredient(null)
        }} title={`${t('options.ingredients.form.title')} ${ingredient.id ? t('options.ingredients.form.title.edit') : t('options.ingredients.form.title.create')}`}>
            <label htmlFor="formName" className="form-label">{t('options.ingredients.form.name')}</label>
            <input id="formName" type="text" className="form-control" placeholder="Name" value={ingredient.name} onChange={e => setIngredient({ ...ingredient, name: e.target.value })} />
        </Modal> : <div />}

        <button className="btn btn-primary" onClick={() => setIngredient({ name: "" })}>{t('options.ingredients.create')}</button>

        <table className="table table-striped">
            <thead>
                <tr>
                    <th>{t('options.ingredients.table.name')}</th>
                    <th>{t('options.ingredients.table.usage')}</th>
                    <th>{t('options.ingredients.table.category')}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {ingredients.map(ingredient =>
                    <tr key={ingredient.id}>
                        <td><Link to={`/ingredients/${ingredient.id}`}>{ingredient.name}</Link></td>
                        <td>{ingredient.usages}</td>
                        <td>
                            <Select options={data.categories.map(c => ({ value: c.id, label: c.name }))} isClearable={true}
                                value={{ label: (ingredient.category_id ? data.categories.find(f => f.id === ingredient.category_id).name : "") }}
                                onChange={(e) => {
                                    updateIngredient({
                                        variables: { ingredient: { id: ingredient.id, name: ingredient.name, category_id: (e ? e.value : null) } },
                                        onCompleted: (data) => {
                                            setIngredients(ingredients.map((u) => (u.id === data.updateIngredient.id) ? data.updateIngredient : u));
                                            setIngredient(null);
                                        }
                                    })
                                }} />

                        </td>
                        <td>
                            <button className="btn btn-primary" onClick={() => setIngredient(ingredient)}>{t('button.edit')}</button>&nbsp;
                            <button className="btn btn-danger" onClick={() => dialog.confirm(t('options.ingredients.table.delete.confirm', { ingredient: ingredient.name })).then((value) => {
                                if (value) {
                                    deleteIngredient({
                                        variables: {
                                            ingredient: { id: ingredient.id, name: ingredient.name }
                                        }, onCompleted: (data) =>
                                            setIngredients(ingredients.filter((u) => u.id !== ingredient.id)),
                                        onError: (error) => {
                                            console.log(error)
                                            alert("In USE!");
                                        }
                                    })
                                }
                            })
                            } disabled={ingredient.usages > 0}>{t('button.delete')}</button>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div >);
};