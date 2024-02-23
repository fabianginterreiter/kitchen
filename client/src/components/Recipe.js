import './Recipe.css';

import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";

const GET_RECIPE = gql`query GetRecipe($recipeId: ID!) {
    recipe(id: $recipeId) {
      id, name, portions, source, preparations {
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
        <div>
            <div className="container text-right">
                <div className="dropdown">
                    <button className="btn btn-default dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Options
                    </button>
                    <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to={`/recipes/${recipeId}/edit`}>Bearbeiten</Link></li>
                        <li><hr class="dropdown-divider" /></li>
                        <li><a className="dropdown-item" href="#">Löschen</a></li>
                    </ul>
                </div>
            </div>

            <h1 className="display-1">{data.recipe.name}</h1>

            <hr />

            Portions: {data.recipe.portions}

            <h2>Zubereitung</h2>

            <table className="table table-striped">
                <tbody>
                    {data.recipe.preparations.map((step) => <tr key={step.id}>
                        <td className="ingredient">{getIngredient(step)}</td>
                        <td className="description">{step.description}</td>
                    </tr>)}
                </tbody>
            </table>

            {(data.recipe.source != null && data.recipe.source.length > 0 ? <div>{data.recipe.source}</div> : "")}
        </div>
    );
};