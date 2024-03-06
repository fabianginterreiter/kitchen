import { Link } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from './Utils.js';
import { useState } from "react";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const GET_INGREDIENTS = gql`query GetIngredients {
    ingredients {
      id
      name
      usages
    }
  }`;

const CREATE_INGREDIENT = gql`mutation Mutation($ingredient: IngredientInput) {
    createIngredient(ingredient: $ingredient) { id, name }
  }`;

const UPDATE_INGREDIENT = gql`mutation Mutation($ingredient: IngredientInput) {
    updateIngredient(ingredient: $ingredient) { id, name }
  }`;


const DELETE_INGREDIENT = gql`mutation Mutation($ingredient: IngredientInput) {
    deleteIngredient(ingredient: $ingredient)
}`;

export default function Ingredients() {
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

    return (
        <div>
            <h1>Zutaten</h1>
            <hr />

            {ingredient !== null ? <Modal show={true} onHide={() => setIngredient(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Zutat {ingredient.id ? "bearbeiten" : "erstellen"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label htmlFor="formName" className="form-label">Name</label>
                    <input id="formName" type="text" className="form-control" placeholder="Name" value={ingredient.name} onChange={e => setIngredient({ ...ingredient, name: e.target.value })} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIngredient(null)}>
                        Abbrechen
                    </Button>
                    <Button variant="primary" onClick={() => {
                        if (ingredient.id) {
                            updateIngredient({
                                variables: { ingredient: { id: ingredient.id, name: ingredient.name } },
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
                    }}>Speichern</Button>
                </Modal.Footer>
            </Modal> : <div />}

            <button className="btn btn-primary" onClick={() => setIngredient({ name: "" })}>Erstellen</button>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Verwendungen</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {ingredients.map(ingredient =>
                        <tr key={ingredient.id}>
                            <td><Link to={`/ingredients/${ingredient.id}`}>{ingredient.name}</Link></td>
                            <td>{ingredient.usages}</td>
                            <td>
                                <button className="btn btn-primary" onClick={() => setIngredient(ingredient)}>Edit</button>
                                <button className="btn btn-danger" onClick={() =>
                                    deleteIngredient({
                                        variables: {
                                            ingredient: { id: ingredient.id, name: ingredient.name }
                                        }, onCompleted: (data) =>
                                            setIngredients(ingredients.filter((u) => u.id !== ingredient.id)),
                                        onError: (error) => {
                                            console.log(error)
                                            alert("In USE!");
                                        }
                                    })} disabled={ingredient.usages > 0}>Delete</button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div >
    );
};