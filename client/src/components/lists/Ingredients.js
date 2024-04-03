import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState, Fragment } from "react";
import { Options, Option } from '../recipes/Options.js';

const GET_LIST = gql`
query GetLIst($listId: ID!) {
    list(id: $listId) {
    id
    name
    closed

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

    const [done, setDone] = useState([]);

    const { loading, error, data } = useQuery(GET_LIST, {
        variables: { listId }
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div id="Cooking">
        <div><Link to="/lists">Listen</Link> » <Link to={`/lists/${data.list.id}`}>{data.list.name}</Link></div>

        <h1>Shopping List</h1>
        <table className="table">
            <thead>
                <tr>
                    <th>Menge</th>
                    <th>Zutat</th>
                </tr>
            </thead>
            <tbody>
                {data.categories.filter((c) => c.id === '0' || data.list.ingredients.find((i) => c.id === i.ingredient.category_id)).map((c) => <Fragment key={c.id}>
                    <tr key={c.id}><td colSpan={2}><b>{c.id === '0' ? 'Unkategorisiert' : c.name}</b></td></tr>
                    {data.list.ingredients.filter((i) => c.id === i.ingredient.category_id || (c.id === '0' && !i.ingredient.category_id)).map((i, k) => <tr key={c.id + k}>
                        <td>{Math.round(i.amount * 100) / 100} {i.unit && <>{i.unit.name}</>}</td>
                        <td><Link to={`/ingredients/${i.ingredient.id}`}>{i.ingredient.name}</Link></td>
                    </tr>)}
                </Fragment>)}
            </tbody>
        </table>
    </div >);
};