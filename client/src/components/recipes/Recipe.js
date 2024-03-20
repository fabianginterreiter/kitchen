import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Options, Option } from './Options.js';
import { Loading, Error } from '../../ui/Utils.js';
import Tags from './Tags.js';
import './Recipe.css';

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

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div id="Recipe">
            <h1>{data.recipe.name}</h1>

            <Tags tags={data.recipe.tags} />

            <div className="recipeOptions">
                <Options size="large">
                    <Option linkTo={`/recipes/${recipeId}/edit`}>Bearbeiten</Option>
                    <Option onClick={() => alert("delete!")}>Löschen</Option>
                </Options>
            </div>

            <div className="row">
                <div className="col-10">Portionen: {data.recipe.portions}</div>
            </div>

            <h2>Zubereitung</h2>

            <table className="table">
                <tbody>
                    {data.recipe.preparations.map((step) => (step.title ?
                        <tr key={step.id}><td colSpan="2"><strong>{step.description}</strong></td></tr>
                        : <tr key={step.id}>
                            <td className="ingredients">{getIngredient(step)}</td>
                            <td className="description">{step.description}</td>
                        </tr>))}
                </tbody>
            </table>

            {(data.recipe.source != null && data.recipe.source.length > 0 ? <p><b>Quelle:</b> {data.recipe.source}</p> : "")}
        </div>
    );
};