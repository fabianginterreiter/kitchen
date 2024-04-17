import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function Recipes({recipes}) {
  const { t } = useTranslation();
    return (<table className="table table-striped">
    <thead><tr><th>{t('recipes.table.name')}</th></tr></thead>
    <tbody>
      {recipes.map(recipe =>
        <tr key={recipe.id}>
          <td><Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link></td>
        </tr>
      )}
    </tbody>
  </table>);
}