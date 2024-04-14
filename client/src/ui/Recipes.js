import { Link } from "react-router-dom";

export default function Recipes({recipes}) {
    return (<table className="table table-striped">
    <thead><tr><th>Name</th></tr></thead>
    <tbody>
      {recipes.map(recipe =>
        <tr key={recipe.id}>
          <td><Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link></td>
        </tr>
      )}
    </tbody>
  </table>);
}