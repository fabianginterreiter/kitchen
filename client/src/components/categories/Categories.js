import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import Modal from '../../ui/Modal.js';

const GET_CATEGORIES = gql`query GetCategories {
    categories {id,name,position}
  }`;

const CREATE_CATEGORY = gql`mutation Mutation($category: CategoryInput) {
    createCategory(category: $category) { id, name, position }
  }`;

const UPDATE_CATEGORY = gql`mutation Mutation($category: CategoryInput) {
    updateCategory(category: $category) { id, name, position }
  }`;


const DELETE_CATEGORY = gql`mutation Mutation($category: CategoryInput) {
    deleteCategory(category: $category)
}`;

export default function Categories() {
    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState([]);

    const [createCategory] = useMutation(CREATE_CATEGORY);
    const [updateCategory] = useMutation(UPDATE_CATEGORY);
    const [deleteCategory] = useMutation(DELETE_CATEGORY);

    const { loading, error } = useQuery(GET_CATEGORIES, {
        onCompleted: (data) => {
            setCategories(data.categories);
        }
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div className="App">
            <h1>Kategorien</h1>

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
                <label htmlFor="formName" className="form-label">Name</label>
                <input id="formName" type="text" className="form-control" placeholder="Name" value={category.name} onChange={e => setCategory({ ...category, name: e.target.value })} />
            </Modal> : <div />}

            <button className="btn btn-primary" onClick={() => setCategory({ name: "", position: categories.length + 1 })}>Erstellen</button>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map(category =>
                        <tr key={category.id}>
                            <td>{category.name} / {category.position}</td>
                            <td>
                                <button className="btn btn-primary" onClick={() => setCategory(category)}>Edit</button>&nbsp;
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
                                    })}>Delete</button></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};