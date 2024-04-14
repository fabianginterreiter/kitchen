import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Loading, Error } from '../../ui/Utils.js';
import Recipe from '../recipes/Recipe.js';

const GET_INGREDIENT = gql`query GetIngredient($ingredientId: ID!) {
    ingredient(id: $ingredientId) { id, name, recipes { id, name } }
  }`;

export default function Ingredients() {
    const { ingredientId } = useParams();

    const { loading, error, data } = useQuery(GET_INGREDIENT, {
        variables: { ingredientId },
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div>
        <div><Link to="/ingredients">Zutaten</Link> » <Link to={`/ingredients/${data.ingredient.id}`}>{data.ingredient.name}</Link></div>
        <Recipe />
    </div>);
};