import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../../ui/Utils.js';
import { useState } from "react";
import Modal from '../../../ui/Modal.js';
import { useTranslation } from 'react-i18next';

const GET_CATEGORIES = gql`query GetCategories {
    categories {id,name,position}
  }`;

const CREATE_CATEGORY = gql`mutation Mutation($category: CategoryInput) {
    createCategory(category: $category) { id, name, position }
  }`;

const UPDATE_CATEGORY = gql`mutation Mutation($category: CategoryInput) {
    updateCategory(category: $category) { id, name, position }
  }`;

const SWITCH_CATEGORIES = gql`mutation Mutation($category1: CategoryInput, $category2: CategoryInput) {
    category1: updateCategory(category: $category1) { id, name, position }
    category2: updateCategory(category: $category2) { id, name, position }
  }`;

const DELETE_CATEGORY = gql`mutation Mutation($category: CategoryInput) {
    deleteCategory(category: $category)
}`;

export default function Categories() {
    const { t } = useTranslation();

    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState([]);

    const [createCategory] = useMutation(CREATE_CATEGORY);
    const [updateCategory] = useMutation(UPDATE_CATEGORY);
    const [deleteCategory] = useMutation(DELETE_CATEGORY);
    const [switchCategories] = useMutation(SWITCH_CATEGORIES);

    const { loading, error } = useQuery(GET_CATEGORIES, {
        onCompleted: (data) => {
            setCategories(data.categories);
        }
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div className="App">
            <h1>{t('options.categories')}</h1>

            {category ? <Modal visible={category !== null} onClose={() => setCategory(null)} onSave={() => {
                if (category.id) {
                    updateCategory({
                        variables: { category: { id: category.id, name: category.name, position: category.position } },
                        onCompleted: (data) => {
                            setCategories(categories.map((u) => (u.id === data.updateCategory.id) ? data.updateCategory : u));
                            setCategory(null);
                        }
                    })
                } else {
                    createCategory({
                        variables: {
                            category
                        },
                        onCompleted: (data) => {
                            setCategories([...categories, data.createCategory]);
                            setCategory(null);
                        }
                    })
                }

                setCategory(null)
            }} title={`Kategorie ${category.id ? "bearbeiten" : "erstellen"}`}>
                <label htmlFor="formName" className="form-label">{t('options.categories.form.name')}</label>
                <input id="formName" type="text" className="form-control" placeholder="Name" value={category.name} onChange={e => setCategory({ ...category, name: e.target.value })} />
            </Modal> : <div />}

            <button className="btn btn-primary" onClick={() => setCategory({
                name: "",
                position: (categories.length === 0 ? 1 : categories[categories.length - 1].position + 1)
            })}>{t('options.categories.create')}</button>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>{t('options.categories.table.name')}</th>
                        <th>{t('options.categories.table.options')}</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category, key) =>
                        <tr key={category.id}>
                            <td>{category.name} / {category.position}</td>
                            <td>
                                <button disabled={key === 0} onClick={() => {
                                    const c1 = categories[key - 1];
                                    const c2 = category;

                                    switchCategories({
                                        variables: {
                                            category1: { id: c1.id, name: c1.name, position: c2.position },
                                            category2: { id: c2.id, name: c2.name, position: c1.position }
                                        },

                                        onCompleted: (data) => {
                                            setCategories(categories.map((c) => {
                                                if (c.id === data.category1.id) {
                                                    return data.category2;
                                                } else if (c.id === data.category2.id) {
                                                    return data.category1;
                                                } else {
                                                    return c;
                                                }
                                            }))
                                        }
                                    });
                                }}>{t('button.up')}</button>
                                <button disabled={key === categories.length - 1} onClick={() => {
                                    const c1 = category;
                                    const c2 = categories[key + 1];

                                    switchCategories({
                                        variables: {
                                            category1: { id: c1.id, name: c1.name, position: c2.position },
                                            category2: { id: c2.id, name: c2.name, position: c1.position }
                                        },

                                        onCompleted: (data) => {
                                            setCategories(categories.map((c) => {
                                                if (c.id === data.category1.id) {
                                                    return data.category2;
                                                } else if (c.id === data.category2.id) {
                                                    return data.category1;
                                                } else {
                                                    return c;
                                                }
                                            }))
                                        }
                                    });
                                }}>{t('button.down')}</button>
                            </td>
                            <td>
                                <button className="btn btn-primary" onClick={() => setCategory(category)}>{t('button.edit')}</button>&nbsp;
                                <button className="btn btn-danger" onClick={() =>
                                    deleteCategory({
                                        variables: {
                                            category: { id: category.id, name: category.name }
                                        }, onCompleted: (data) =>
                                            setCategories(categories.filter((u) => u.id !== category.id)),
                                        onError: (error) => {
                                            console.log(error)
                                            alert("In USE!");
                                        }
                                    })}>{t('button.delete')}</button></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};