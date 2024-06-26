import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Loading, Error } from '../../ui/Utils.js';
import Recipe from '../recipes/Recipe.js';
import { useTranslation } from 'react-i18next';

const GET_TAG = gql`query GetTag($tagId: ID!) {
    tag(id: $tagId) { id, name }
  }`;

export default function TagRecipe() {
    const { t } = useTranslation();
    const { tagId } = useParams();

    const { loading, error, data } = useQuery(GET_TAG, {
        variables: { tagId },
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div>
        <div><Link to="/tags">{t('tags')}</Link> » <Link to={`/tags/${data.tag.id}`}>#{data.tag.name}</Link></div>
        <Recipe />
    </div>)
}