import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Loading, Error } from '../Utils.js';

import Recipe from '../recipes/Recipe.js';

const GET_TAG = gql`query GetTag($tagId: ID!) {
    tag(id: $tagId) { id, name }
  }`;

export default function TagRecipe() {
    const { tagId } = useParams();

    const { loading, error, data } = useQuery(GET_TAG, {
        variables: { tagId },
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div>
        <div><Link to="/tags">Tags</Link> » <Link to={`/tags/${data.tag.id}`}>#{data.tag.name}</Link></div>
        <Recipe />
    </div>)
}