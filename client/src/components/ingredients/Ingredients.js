import { Link } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import Modal from '../../ui/Modal.js';

const GET_INGREDIENTS = gql`query GetIngredients {
    ingredients { id, name, usages }
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

    const { loading, error } = useQuery(GET_INGREDIENTS, {
        onCompleted: (data) => setIngredients(data.ingredients)
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div>
            <h1>Zutaten</h1>

            {ingredient ? <Modal visible={ingredient !== null} onClose={() => setIngredient(null)} onSave={() => {
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
            }} title={`Zutat ${ingredient.id ? "bearbeiten" : "erstellen"}`}>
                <label htmlFor="formName" className="form-label">Name</label>
                <input id="formName" type="text" className="form-control" placeholder="Name" value={ingredient.name} onChange={e => setIngredient({ ...ingredient, name: e.target.value })} />
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
                                <button className="btn btn-primary" onClick={() => setIngredient(ingredient)}>Edit</button>&nbsp;
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