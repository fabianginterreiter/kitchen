import { Link, useParams } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { Options, Option } from '../../ui/Options.js';
import { formatDate } from '../../ui/DateUtils.js';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const { listId } = useParams();

    const { loading, error, data } = useQuery(GET_LIST, {
        variables: { listId }
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div>
        <div><Link to="/lists">{t('lists')}</Link></div>
        <h1>{data.list.name}</h1>

        {data.list.closed && <span>{t('list.closed')}</span>}

        <h2>{t('list.recipes')}</h2>

        <div className="recipeOptions">
            <Options size="large">
                <Option linkTo={`/lists/${listId}/edit`}>{t('list.options.edit')}</Option>
                <Option linkTo={`/lists/${listId}/ingredients`}>{t('list.options.ingredients')}</Option>
                <Option onClick={() => alert("delete!")}>{t('list.options.delete')}</Option>
            </Options>
        </div>

        {data.list.description}

        <table className="table">
            <thead>
                <tr>
                    <th>{t('list.table.recipe')}</th>
                    <th>{t('list.table.date')}</th>
                    <th>{t('list.table.portions')}</th>
                </tr>
            </thead>
            <tbody>
                {data.list.entries.map((entry) => <tr key={entry.id}>
                    <td><Link to={`/recipes/${entry.recipe.id}?portions=${entry.portions}`}>{entry.recipe.name}</Link></td>
                    <td>{entry.date && formatDate(new Date(entry.date))}</td>
                    <td>{entry.portions}</td>
                </tr>)}
            </tbody>
        </table>
    </div >);
};