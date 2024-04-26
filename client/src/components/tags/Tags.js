import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useTranslation } from 'react-i18next';

const GET_TAGS = gql`query GetTags {
    tags { id, name }
  }`;

export default function Tags() {
    const { t } = useTranslation();

    const { loading, error, data } = useQuery(GET_TAGS);

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div>
        <h1>{t('tags')}</h1>

        <table>
            <thead>
                <tr>
                    <th>{t('tags.table.name')}</th>
                </tr>
            </thead>
            <tbody>
                {data.tags.map(tag => <tr key={tag.id}>
                    <td><Link to={`/tags/${tag.id}`}>{tag.name}</Link></td>
                </tr>)}
            </tbody>
        </table>
    </div>);
};