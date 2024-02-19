import './Recipe.css';

import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";

const GET_RECIPE = gql`query GetRecipe($recipeId: ID!) {
    recipe(id: $recipeId) {
      id, name, preparations {
        id, step, title, amount, unit {id, name}, ingredient {id, name}, description
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

export default function Recipe() {
    const { recipeId } = useParams();

    const { loading, error, data } = useQuery(GET_RECIPE, {
        variables: { recipeId },
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    return (
        <div className="App">
            <h1>{data.recipe.name}</h1>

            <Link to={`/recipes/${recipeId}/edit`}>Edit</Link>

            <table>
                <tbody>
                    {data.recipe.preparations.map((step) => <tr key={step.id}>
                        <td className="ingredient">{getIngredient(step)}</td>
                        <td className="description">{step.description}</td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    );
};