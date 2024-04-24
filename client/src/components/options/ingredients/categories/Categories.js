import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../../../ui/Utils.js';
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import Modal from '../../../../ui/Modal.js';
import useDialog from '../../../../ui/Dialog.js';

const GET_CATEGORIES = gql`query GetIngredientsCategories {
    ingredientsCategories {id,name}
  }`;

const CREATE_CATEGORY = gql`mutation Mutation($category: IngredientsCategoryInput) {
    createIngredientsCategory(category: $category) { id, name }
  }`;

const UPDATE_CATEGORY = gql`mutation Mutation($category: IngredientsCategoryInput) {
    updateIngredientsCategory(category: $category) { id, name }
  }`;

const DELETE_CATEGORY = gql`mutation Mutation($category: IngredientsCategoryInput) {
    deleteIngredientsCategory(category: $category)
}`;

export default function IngredientCategories() {
    const { t } = useTranslation();

    const dialog = useDialog();

    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState([]);

    const [createCategory] = useMutation(CREATE_CATEGORY);
    const [updateCategory] = useMutation(UPDATE_CATEGORY);
    const [deleteCategory] = useMutation(DELETE_CATEGORY);

    const { loading, error } = useQuery(GET_CATEGORIES, {
        onCompleted: (data) => {
            setCategories(data.ingredientsCategories);
        }
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div className="App">
            <h1>{t('options.ingredients.categories')}</h1>

            {dialog.render}

            {category ? <Modal visible={category !== null} onClose={() => setCategory(null)} onSave={() => {
                if (category.id) {
                    updateCategory({
                        variables: { category: { id: category.id, name: category.name, position: category.position } },
                        onCompleted: (data) => {
                            setCategories(categories.map((u) => (u.id === data.updateIngredientsCategory.id) ? data.updateIngredientsCategory : u));
                            setCategory(null);
                        }
                    })
                } else {
                    createCategory({
                        variables: {
                            category
                        },
                        onCompleted: (data) => {
                            setCategories([...categories, data.createIngredientsCategory]);
                            setCategory(null);
                        }
                    })
                }

                setCategory(null)
            }} title={`${t('options.ingredients.categories.form.title')} ${category.id ? t('options.ingredients.categories.form.title.edit') : t('options.ingredients.categories.form.title.create')}`}>
                <label htmlFor="formName" className="form-label">{t('options.ingredients.categories.form.name')}</label>
                <input id="formName" type="text" className="form-control" placeholder="Name" value={category.name} onChange={e => setCategory({ ...category, name: e.target.value })} />
            </Modal> : <div />}

            <button className="btn btn-primary" onClick={() => setCategory({
                name: ""
            })}>{t('options.ingredients.categories.create')}</button>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>{t('options.ingredients.categories.table.name')}</th>
                        <th>{t('options.ingredients.categories.table.options')}</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category, key) =>
                        <tr key={category.id}>
                            <td>{category.name}</td>
                            <td>
                                <button className="btn btn-primary" onClick={() => setCategory(category)}>{t('button.edit')}</button>&nbsp;
                                <button className="btn btn-danger" onClick={() =>
                                    dialog.confirm(t('options.ingredients.categories.table.delete.confirm', { category: category.name })).then((value) => {
                                        if (value) {
                                            deleteCategory({
                                                variables: {
                                                    category: { id: category.id, name: category.name }
                                                }, onCompleted: (data) =>
                                                    setCategories(categories.filter((u) => u.id !== category.id)),
                                                onError: (error) => {
                                                    console.log(error)
                                                    alert("In USE!");
                                                }
                                            })
                                        }
                                    })
                                }>{t('button.delete')}</button></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};