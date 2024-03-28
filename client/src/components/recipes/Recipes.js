import { Link, useSearchParams } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { useState } from "react";
import Collapse from "../../ui/Collapse.js";
import Select from 'react-select';
import { Loading, Error } from '../../ui/Utils.js';

const GET_RECIPES = gql`query GetRecipes {
    recipes { id, name, portions, vegan, vegetarian, tags { id } }
    tags { id, name }
  }`;

export default function Recipes() {

  const [filter, setFilter] = useState({ name: "", tags: [], vegan: false, vegetarian: false });
  const [showFilter, setShowFilter] = useState(false);

  const { loading, error, data } = useQuery(GET_RECIPES);

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  const isVisible = (recipe) => {
    if (!recipe.name.toLowerCase().includes(filter.name.toLowerCase())) {
      return false;
    }

    if (filter.tags.find(id => !recipe.tags.find(t => t.id === id))) {
      return false;
    }

    if (filter.vegan && !recipe.vegan) {
      return false;
    }

    if (filter.vegetarian && !recipe.vegetarian) {
      return false;
    }

    return true;
  }

  return (<div>
    <h1>Rezepte</h1>

    <Link to={'/recipes/create'} className="button">Erstellen</Link>

    <div className="box">
      <div>
        <label htmlFor="filterByName">Filter: </label>
        <input id="filterByName" type="search" placeholder="Search"
          value={filter.name}
          onChange={(e) => setFilter({ ...filter, name: e.target.value })} />
        <button type="button" onClick={() => setShowFilter(!showFilter)}>
          More Filter
        </button>
      </div>

      <Collapse visible={showFilter}>
        <div>
          <Select options={data.tags.map((t) => ({ value: t.id, label: t.name }))} isMulti={true}
            onChange={e => setFilter({ ...filter, tags: e.map(t => t.value) })}
            isClearable={true} />
        </div>
        <div>
          <input type="checkbox" defaultChecked={filter.vegan} onClick={(e) => setFilter({ ...filter, vegan: e.target.checked })} /> Vegan
        </div>
        <div>
          <input type="checkbox" defaultChecked={filter.vegetarian} onClick={(e) => setFilter({ ...filter, vegetarian: e.target.checked })} /> Vegetarian
        </div>
      </Collapse>
    </div>

    <table className="table table-striped">
      <thead><tr><th>Name</th></tr></thead>
      <tbody>
        {data.recipes.filter((r) => isVisible(r)).map(recipe =>
          <tr key={recipe.id}>
            <td><Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link></td>
          </tr>
        )}
      </tbody>
    </table>
  </div>);
};