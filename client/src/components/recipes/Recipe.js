import { useQuery, gql } from '@apollo/client';
import { useParams, useSearchParams } from 'react-router-dom';
import { Options, Option } from '../../ui/Options.js';
import { Loading, Error } from '../../ui/Utils.js';
import Tags from './Tags.js';
import { useState } from "react";
import './Recipe.css';
import Text from '../../ui/Text.js';
import { useTranslation } from 'react-i18next';

const GET_RECIPE = gql`query GetRecipe($recipeId: ID!) {
    recipe(id: $recipeId) {
      id, name, portions, description, source, preparations {
        id, step, title, amount, unit {name}, ingredient {name}, description
      }
      tags {id, name}
    }
  }`;

export default function Recipe() {
    const { t } = useTranslation();
    const { recipeId } = useParams();

    const [searchParams] = useSearchParams();

    const [portions, setPortions] = useState(0);

    const { loading, error, data } = useQuery(GET_RECIPE, {
        variables: { recipeId },
        onCompleted: (data) => {
            if (searchParams.get('portions')) {
                setPortions(parseInt(searchParams.get('portions')));
            } else {
                setPortions(data.recipe.portions);
            }
        }
    });

    const getIngredient = (step) => {
        if (!step.ingredient) {
            return;
        }

        var amount = "";

        if (step.amount) {
            amount = (step.amount / data.recipe.portions * portions) + " ";

            if (step.unit) {
                amount += step.unit.name + " ";
            }
        }

        return <>{amount}{step.ingredient.name}</>
    }

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div id="Recipe">
        <h1>{data.recipe.name}</h1>

        <Tags tags={data.recipe.tags} />

        <div className="recipeOptions">
            <Options size="large">
                <Option linkTo={`/recipes/${recipeId}/edit`}>{t('recipe.options.edit')}</Option>
                <Option linkTo={`/recipes/${recipeId}/cooking?portions=${portions}`}>{t('recipe.options.cooking')}</Option>
                <Option onClick={() => alert("delete!")}>{t('recipe.options.delete')}</Option>
            </Options>
        </div>

        <div className="description"><Text value={data.recipe.description} /></div>

        <div className="row">
            <div className='portions'>Portionen:
                <input type="number" min="1" step="1" value={portions} onChange={(e) => setPortions(parseInt(e.target.value))} />
                {data.recipe.portions !== portions && <button onClick={() => setPortions(data.recipe.portions)}>x</button>}
            </div>
        </div>

        <h2>{t('recipe.preparations')}</h2>

        <table>
            <tbody>
                {data.recipe.preparations.map((step) => (step.title ?
                    <tr key={step.id}>
                        <td colSpan="2"><strong>{step.description}</strong></td>
                    </tr>
                    : <tr key={step.id}>
                        <td className="ingredients">{getIngredient(step)}</td>
                        <td className="description">{step.description}</td>
                    </tr>))}
            </tbody>
        </table>

        {(data.recipe.source != null && data.recipe.source.length > 0 && <p><b>{t('recipe.source')}:</b> {data.recipe.source}</p>)}
    </div>);
};