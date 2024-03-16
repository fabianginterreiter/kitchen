import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";

const GET_RECIPE = gql`query GetRecipe($recipeId: ID!) {
    recipe(id: $recipeId) {
      id, name, portions, source, preparations {
        id, step, title, amount, unit {name}, ingredient {name}, description
      }
      tags {id, name}
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
            <h1>{data.recipe.name}</h1>

            <hr />

            <div className="row hideForPrinting">
                <div className="col-12">
                    <Link className="btn btn-primary" to={`/recipes/${recipeId}/edit`}>Bearbeiten</Link>&nbsp;
                    <button type="button" className="btn btn-danger">Löschen</button>
                </div>
            </div>

            <div className="row">
                <div className="col-10">Portionen: {data.recipe.portions}</div>
            </div>

            {data.recipe.tags.map((t) => (<Link key={t.id} to={`/tags/${t.id}`}>#{t.name}</Link>))}

            <h2>Zubereitung</h2>

            <table className="table table-striped" id="preparations">
                <tbody>
                    {data.recipe.preparations.map((step) => (step.title ?
                        <tr key={step.id}><td colSpan="2"><strong>{step.description}</strong></td></tr>
                        : <tr key={step.id}>
                            <td className="col-2">{getIngredient(step)}</td>
                            <td className="col-10">{step.description}</td>
                        </tr>))}
                </tbody>
            </table>

            {(data.recipe.source != null && data.recipe.source.length > 0 ? <figure className="text-end">
                <blockquote className="blockquote">
                    <p>{data.recipe.source}</p>
                </blockquote>
                <figcaption className="blockquote-footer">
                    <cite title="Source Title">Quelle</cite>
                </figcaption>
            </figure> : "")}
        </div>
    );
};