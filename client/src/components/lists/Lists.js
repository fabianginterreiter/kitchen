import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import { Options, Option } from '../../ui/Options.js';
import { useTranslation } from 'react-i18next';

const GET_LISTS = gql`
query Recipes {
  lists(closed: false) {id,name,startDate, endDate, closed }
  closed: lists(closed: true) {id,name,startDate, endDate, closed }
}`;


export default function Lists() {
  const { t } = useTranslation();

  const { loading, error, data } = useQuery(GET_LISTS);

  const [filters, setFilters] = useState({ name: "", closed: false });

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <div>
    <h1>{t('lists')}</h1>

    <div className="recipeOptions">
      <Options size="large">
        <Option linkTo={`/lists/create`}>{t('lists.option.new')}</Option>
        <Option linkTo={`/lists/create?template=week`}>{t('lists.option.newWeekplan')}</Option>
      </Options>
    </div>

    <fieldset>
      <legend>{t('lists.form.filter')}</legend>
      <div>
        <input type="text" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder={t('lists.form.filter')} />
      </div>
      <div>
        <input type="checkbox" value={filters.closed} onChange={(e) => setFilters({ ...filters, closed: e.target.checked })} id="closed" />
        <label htmlFor="closed">{t('lists.form.closed')}</label>
      </div>
    </fieldset>
    <table className="table">
      <thead>
        <tr>
          <th>{t('lists.table.name')}</th>
          <th>{t('lists.table.start')}</th>
          <th>{t('lists.table.end')}</th>
        </tr>
      </thead>
      <tbody>
        {data.lists
          .filter(list => (list.name.toLowerCase().includes(filters.name.toLowerCase())))
          .map(list => <tr key={list.id}>
            <td><Link to={`/lists/${list.id}`}>{list.name}</Link></td>
            <td>{list.startDate}</td>
            <td>{list.endDate}</td>
          </tr>)}
      </tbody>
    </table>

    {filters.closed && <div>
      <h2>{t('lists.closed')}</h2>
      <table className="table">
        <thead>
          <tr>
            <th>{t('lists.table.name')}</th>
            <th>{t('lists.table.start')}</th>
            <th>{t('lists.table.end')}</th>
          </tr>
        </thead>
        <tbody>
          {data.closed
            .filter(list => (list.name.toLowerCase().includes(filters.name.toLowerCase())))
            .map(list => <tr key={list.id}>
              <td><Link to={`/lists/${list.id}`}>{list.name}</Link></td>
              <td>{list.startDate}</td>
              <td>{list.endDate}</td>
            </tr>)}
        </tbody>
      </table>
    </div>}
  </div>;
};