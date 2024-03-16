import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { useState } from "react";
import { Loading, Error } from '../Utils.js';
import Select from 'react-select';

const GET_RECIPES = gql`query GetRecipes {
    recipes { id, name, portions, vegan, vegetarian, tags { id } }
    tags { id, name }
  }`;

export default function Recipes() {

  const [filter, setFilter] = useState({ name: "", tags: [], vegan: false, vegetarian: false });

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

    <hr />

    <div className="row">
      <div className="col-12">
        <Link to={'/recipes/create'} className="btn btn-primary">Erstellen</Link>
      </div>
    </div>

    <div className="card card-body">
      <div className="row">
        <div className="col-10">
          <label htmlFor="filterByName" className="form-label">Filter: </label>
          <input id="filterByName" className="form-control me-2" type="search" placeholder="Search" aria-label="Search"
            value={filter.name}
            onChange={(e) => setFilter({ ...filter, name: e.target.value })} />
        </div>
        <div className="col-2">
          <button className="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
            More Filter
          </button>
        </div>
      </div>
      <div className="row collapse" id="collapseExample">
        <div className="row">
          <div className="col-12">
            <Select options={data.tags.map((t) => ({ value: t.id, label: t.name }))} isMulti={true}
              onChange={e => setFilter({ ...filter, tags: e.map(t => t.value) })}
              isClearable={true} />
          </div>
        </div>
        <div className="row">
          <div className="col-3">
            <input type="checkbox" defaultChecked={filter.vegan} onClick={(e) => setFilter({ ...filter, vegan: e.target.checked })} /> Vegan
          </div>
          <div className="col-3">
            <input type="checkbox" defaultChecked={filter.vegetarian} onClick={(e) => setFilter({ ...filter, vegetarian: e.target.checked })} /> Vegetarian
          </div>
        </div>
      </div>
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