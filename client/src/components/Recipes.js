import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { useState } from "react";
import { Loading, Error } from './Utils.js';

const GET_RECIPES = gql`query GetRecipes {
    recipes {
      id, name, portions, vegan, vegetarian
    }
  }`;

export default function Recipes() {

  const [recipes, setRecipes] = useState([]);
  const [filter, setFilter] = useState("");

  const { loading, error, data } = useQuery(GET_RECIPES, {
    onCompleted: (data) => setRecipes(data.recipes)
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

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
          <label htmlFor="filterByName" className="form-label">Filter: </label><input id="filterByName" className="form-control me-2" type="search" placeholder="Search" aria-label="Search" value={filter} onChange={(e) => {
            setFilter(e.target.value);
            setRecipes(data.recipes.filter((r) => r.name.toLowerCase().includes(e.target.value.toLowerCase())));
          }} />
        </div>
        <div className="col-2">
          <button className="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
            More Filter
          </button>
        </div>
      </div>
      <div className="row collapse" id="collapseExample">
        <div className="col-12">
          Some placeholder content for the collapse component. This panel is hidden by default but revealed when the user activates the relevant trigger.
        </div>
      </div>
    </div>

    <table className="table table-striped">
      <thead><tr><th>Name</th></tr></thead>
      <tbody>
        {recipes.map(recipe =>
          <tr key={recipe.id}>
            <td><Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link></td>
          </tr>
        )}
      </tbody>
    </table>
  </div>);
};