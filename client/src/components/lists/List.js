import { Link, useParams } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { Options, Option } from '../recipes/Options.js';

const GET_LIST = gql`
query GetLIst($listId: ID!) {
    list(id: $listId) {
    id, name, description, closed,
    entries {
      id,
      portions,
      date,
      recipe { id, name }
    }
  }
}`;


export default function List() {
    const { listId } = useParams();

    const { loading, error, data } = useQuery(GET_LIST, {
        variables: { listId }
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div>
        <div><Link to="/lists">Listen</Link></div>
        <h1>{data.list.name}</h1>

        {data.list.closed && <span>Abgeschlossen</span>}

        <h2>Rezepte</h2>

        <div className="recipeOptions">
            <Options size="large">
                <Option linkTo={`/lists/${listId}/edit`}>Bearbeiten</Option>
                <Option linkTo={`/lists/${listId}/ingredients`}>Zutaten</Option>
                <Option onClick={() => alert("delete!")}>Löschen</Option>
            </Options>
        </div>

        {data.list.description}

        <table className="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Datum</th>
                    <th>Portionen</th>
                </tr>
            </thead>
            <tbody>
                {data.list.entries.map((entry) => <tr key={entry.id}>
                    <td><Link to={`/recipes/${entry.recipe.id}?portions=${entry.portions}`}>{entry.recipe.name}</Link></td>
                    <td>{entry.date}</td>
                    <td>{entry.portions}</td>
                </tr>)}
            </tbody>
        </table>
    </div >);
};