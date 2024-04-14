import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Loading, Error } from '../../ui/Utils.js';
import Recipes from '../../ui/Recipes.js';

const GET_TAG = gql`query GetTag($tagId: ID!) {
    tag(id: $tagId) { id, name, recipes { id, name } }
  }`;

export default function Ingredients() {
  const { tagId } = useParams();

  const { loading, error, data } = useQuery(GET_TAG, {
    variables: { tagId },
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (<div>
    <div><Link to="/tags">Tags</Link></div>
    <h1>{data.tag.name}</h1>
    <Recipes recipes={data.tag.recipes} />
  </div>);
};