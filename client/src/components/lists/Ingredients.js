import { Link, useParams } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState, Fragment } from "react";
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const { listId } = useParams();

    const [done, setDone] = useState([]);

    const { loading, error, data } = useQuery(GET_LIST, {
        variables: { listId }
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div className="Fullscreen">
        <header>
            <div className="title">{data.list.name}</div>
        </header>

        <div><Link to="/lists">{t('lists')}</Link> » <Link to={`/lists/${data.list.id}`}>{data.list.name}</Link></div>
        <table className="table">
            <thead>
                <tr>
                    <th>{t('list.ingredients.table.amount')}</th>
                    <th>{t('list.ingredients.table.ingredient')}</th>
                </tr>
            </thead>
            <tbody>
                {data.categories.filter((c) => c.id === '0' || data.list.ingredients.find((i) => c.id === i.ingredient.category_id)).map((c) => <Fragment key={c.id}>
                    <tr key={c.id}><td colSpan={2}><b>{c.id === '0' ? t('list.ingredients.table.uncategorized') : c.name}</b></td></tr>
                    {data.list.ingredients.filter((i) => c.id === i.ingredient.category_id || (c.id === '0' && !i.ingredient.category_id)).map((i, k) => <tr key={c.id + k}>
                        <td>{Math.round(i.amount * 100) / 100} {i.unit && <>{i.unit.name}</>}</td>
                        <td><Link to={`/ingredients/${i.ingredient.id}`}>{i.ingredient.name}</Link></td>
                    </tr>)}
                </Fragment>)}
            </tbody>
        </table>
    </div >);
};