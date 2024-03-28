import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Outlet } from "react-router-dom";

import Recipe from './components/recipes/Recipe';
import RecipeEdit from './components/recipes/RecipeEdit';
import RecipeCreate from './components/recipes/RecipeCreate';
import Recipes from './components/recipes/Recipes';
import OptionsIngredients from './components/options/ingredients/Ingredients';
import Ingredient from './components/ingredients/Ingredient';
import Ingredients from './components/ingredients/Ingredients';
import IngredientRecipe from './components/ingredients/IngredientRecipe';
import OptionsUnits from './components/options/units/Units';
import Categories from './components/categories/Categories';
import Tags from './components/tags/Tags';
import Tag from './components/tags/Tag';
import TagRecipe from './components/tags/TagRecipe';
import OptionsExport from './components/options/export/Export';
import OptionsCategories from './components/options/categories/Categories';
import OptionsIngredientsCategories from './components/options/ingredients/categories/Categories';
import Home from './components/Home';

import './global.css';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: '/data/graphql',
  cache: new InMemoryCache(),
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [{
      path: "",
      element: <Home />
    }, {
      path: "options",
      element: <Outlet />,
      children: [{
        path: "units",
        element: <OptionsUnits />
      }, {
        path: "export",
        element: <OptionsExport />
      }, {
        path: "ingredients",
        element: <Outlet />,
        children: [{
          index: true,
          element: <OptionsIngredients />
        }, {
          path: "categories",
          element: <OptionsIngredientsCategories />
        }]
      }, {
        path: "categories",
        element: <OptionsCategories />
      }]
    }, {
      path: "recipes",
      element: <Outlet />,
      children: [{
        index: true,
        element: <Recipes />,
      }, {
        path: "create",
        element: <RecipeCreate />
      }, {
        path: ":recipeId",
        element: <Recipe />
      }, {
        path: ":recipeId/edit",
        element: <RecipeEdit />
      }]
    }, {
      path: "ingredients",
      element: <Outlet />,
      children: [{
        index: true,
        element: <Ingredients />
      }, {
        path: ":ingredientId",
        element: <Ingredient />
      }, {
        path: ":ingredientId/recipes/:recipeId",
        element: <IngredientRecipe />
      }]
    }, {
      path: "tags",
      element: <Outlet />,
      children: [{
        index: true,
        element: <Tags />
      }, {
        path: ":tagId",
        element: <Tag />
      }, {
        path: ":tagId/recipes/:recipeId",
        element: <TagRecipe />
      }]
    }, {
      path: "categories",
      element: <Categories />
    }]
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
