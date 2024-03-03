import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from './Utils.js';

const GET_INGREDIENTS = gql`query GetIngredients {
    ingredients {
      id
      name
      usages
    }
  }`;

export default function Ingredients() {
    const { loading, error, data } = useQuery(GET_INGREDIENTS);

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div>
            <h1>Zutaten</h1>
            <hr />
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Verwendungen</th>
                    </tr>
                </thead>
                <tbody>
                    {data.ingredients.map(ingredient =>
                        <tr key={ingredient.id}>
                            <td><Link to={`/ingredients/${ingredient.id}`}>{ingredient.name}</Link></td>
                            <td>{ingredient.usages}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div >
    );
};