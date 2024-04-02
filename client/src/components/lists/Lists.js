import { Link } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import Modal from '../../ui/Modal.js';
import { Options, Option } from '../recipes/Options.js';

const GET_LISTS = gql`
query Recipes {
  lists {id,name,startDate, endDate, closed }
}`;


export default function Lists() {
  const { loading, error, data } = useQuery(GET_LISTS);

  const [filters, setFilters] = useState({ name: "", closed: false });

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <div>
    <h1>Lists</h1>

    <div className="recipeOptions">
      <Options size="large">
        <Option linkTo={`/lists/create`}>Neue Liste</Option>
        <Option linkTo={`/lists/create?template=week`}>Neuer Wochenplan</Option>
      </Options>
    </div>

    <fieldset>
      <legend>Filter</legend>
      <div>
        <input type="text" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder="Filter" />
      </div>
      <div>
        <input type="checkbox" value={filters.closed} onChange={(e) => setFilters({ ...filters, closed: e.target.checked })} id="closed" />
        <label htmlFor="closed">Zeige geschlossene Einträge</label>
      </div>
    </fieldset>
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {data.lists
          .filter(list => (list.name.toLowerCase().includes(filters.name.toLowerCase()) && (!list.closed)))
          .map(list => <tr key={list.id}>
            <td><Link to={`/lists/${list.id}`}>{list.name}</Link></td>
            <td>{list.startDate}</td>
            <td>{list.endDate}</td>
          </tr>)}
      </tbody>
    </table>

    {filters.closed && <div>
      <h2>Geschlossene Listen</h2>
      <table className="table">
      <thead>
        <tr>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {data.lists
          .filter(list => (list.name.toLowerCase().includes(filters.name.toLowerCase()) && (list.closed)))
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