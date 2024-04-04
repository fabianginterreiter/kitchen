import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Loading, Error } from '../../../ui/Utils.js';
import './Cooking.css';
import { useState } from "react";

const GET_RECIPE = gql`query GetRecipe($recipeId: ID!) {
    recipe(id: $recipeId) {
      id, name, portions preparations {
        id, step, title, amount, unit {name}, ingredient {name}, description
      }
    }
  }`;

function getIngredient(step) {
    if (!step.ingredient) {
        return;
    }

    var amount = "";

    if (step.amount) {
        amount = step.amount + " ";

        if (step.unit) {
            amount += step.unit.name + " ";
        }
    }

    return <>{amount}{step.ingredient.name}</>
}

export default function Cooking() {
    const { recipeId } = useParams();

    const [done, setDone] = useState([]);

    const { loading, error, data } = useQuery(GET_RECIPE, {
        variables: { recipeId },
    });

    const isDone = (step) => done.find((k) => k === step.id);

    const changeDone = (step) => {
        if (isDone(step)) {
            setDone(done.filter((id) => id !== step.id));
        } else {
            setDone([...done, step.id]);
        }
    }

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div id="Cooking" className="Fullscreen">
            <header>
                <div className="title">{data.recipe.name}</div>
            </header>

            <table className="table">
                <tbody>
                    {data.recipe.preparations.map((step) => (step.title ?
                        <tr key={step.id} ><td colSpan="2"><strong>{step.description}</strong></td></tr>
                        : <tr key={step.id} className={(isDone(step) ? 'done' : '')} onClick={() => changeDone(step)}>
                            <td className="ingredients">{getIngredient(step)}</td>
                            <td className="description">{step.description}</td>
                        </tr>))}
                </tbody>
            </table>
        </div>
    );
};