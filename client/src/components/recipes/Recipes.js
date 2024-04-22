import { useQuery, gql } from '@apollo/client';
import { useState } from "react";
import Select from 'react-select';
import { Loading, Error } from '../../ui/Utils.js';
import { useTranslation } from 'react-i18next';
import Recipes from '../../ui/Recipes.js';

const GET_RECIPES = gql`query GetRecipes {
    recipes { id, name, portions, vegan, vegetarian, tags { id }, ingredients { id } }
    tags { id, name }
    ingredients { id, name}
  }`;

export default function RecipesOverview() {
  const { t } = useTranslation();

  const [filter, setFilter] = useState({ name: "", tags: [], ingredients: [], vegan: false, vegetarian: false });

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

    if (filter.ingredients.find(id => !recipe.ingredients.find(i => i.id === id))) {
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
    <h1>{t('recipes')}</h1>

    <fieldset>
      <legend>{t('recipes.filter')}</legend>

      <div>
        <label htmlFor="filterByName">{t('recipes.filter.name')}</label>
        <div>
          <input id="filterByName" type="search" placeholder="Search"
            value={filter.name}
            onChange={(e) => setFilter({ ...filter, name: e.target.value })} /></div>
      </div>
      <div className="row">
        <div className="col-50">
          <input type="checkbox" defaultChecked={filter.vegan} onClick={(e) => setFilter({ ...filter, vegan: e.target.checked })} /> {t('recipes.filter.vegan')}
        </div>
        <div className="col-50">
          <input type="checkbox" defaultChecked={filter.vegetarian} onClick={(e) => setFilter({ ...filter, vegetarian: e.target.checked })} /> {t('recipes.filter.vegetarian')}
        </div>
      </div>
      <div>
        <label htmlFor="tags">{t('recipes.filter.tags')}</label>
        <div>
          <Select id="tags" options={data.tags.map((t) => ({ value: t.id, label: t.name }))} isMulti={true}
            onChange={e => setFilter({ ...filter, tags: e.map(t => t.value) })}
            isClearable={true} />
        </div>
      </div>
      <div>
        <label htmlFor="ingredients">{t('recipes.filter.ingredients')}</label>
        <div id="ingredients">
          <Select options={data.ingredients.map((t) => ({ value: t.id, label: t.name }))} isMulti={true}
            onChange={e => setFilter({ ...filter, ingredients: e.map(t => t.value) })}
            isClearable={true} />
        </div>
      </div>
    </fieldset>

    <Recipes recipes={data.recipes.filter((r) => isVisible(r))} />
  </div >);
};