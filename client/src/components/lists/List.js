import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import { Options, Option } from '../recipes/Options.js';

const GET_LIST = gql`
query GetLIst($listId: ID!) {
    list(id: $listId) {
    id
    name
    startDate
    endDate
    entries {
      id
      portions
      date
      recipe {
        name
        id
      }
    }

    ingredients {
        amount
        unit { id, name }
        ingredient { id, name, category_id }
      }
  }

  categories: ingredientsCategories(includeUncategorized: true) { id, name }
}`;


export default function List() {
    const { listId } = useParams();

    const { loading, error, data } = useQuery(GET_LIST, {
        variables: { listId }
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    const shopping = (ingredients) => {
    };

    return (<div>
        <h1>{data.list.name}</h1>

        <div className="recipeOptions">
            <Options size="large">
                <Option linkTo={`/lists/${listId}/edit`}>Bearbeiten</Option>
                <Option onClick={() => alert("delete!")}>Löschen</Option>
            </Options>
        </div>

        <table className="table">
            <thead>
                <tr>
                    <th>Rezept</th>
                    <th>Datum</th>
                    <th>Portionen</th>
                </tr>
            </thead>
            <tbody>
                {data.list.entries.map((entry) => <tr key={entry.id}>
                    <td><Link to={`/recipes/${entry.recipe.id}`}>{entry.recipe.name}</Link></td>
                    <td>{entry.date}</td>
                    <td>{entry.portions}</td>
                </tr>)}
            </tbody>
        </table>


        <h2>Shopping List</h2>
        <table className="table">
            <thead>
                <tr>
                    <th>Menge</th>
                    <th>Zutat</th>
                </tr>
            </thead>
            <tbody>
                {data.categories.filter((c) => c.id === '0' || data.list.ingredients.find((i) => c.id === i.ingredient.category_id)).map((c) => <>
                    <tr key={c.id}><td colSpan={2}><b>{c.id === '0' ? 'Unkategorisiert' : c.name}</b></td></tr>
                    {data.list.ingredients.filter((i) => c.id === i.ingredient.category_id || (c.id === '0' && !i.ingredient.category_id)).map((i, k) => <tr key={c.id + k}>
                        <td>{Math.round(i.amount*100)/100} {i.unit && <>{i.unit.name}</>}</td>
                        <td>{i.ingredient.name}</td>
                    </tr>)}
                </>)}
            </tbody>
        </table>
    </div >);
};