import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

import Recipe from './components/Recipe';
import RecipeEdit from './components/RecipeEdit';
import RecipeCreate from './components/RecipeCreate';
import Recipes from './components/Recipes';
import Ingredients from './components/Ingredients';
import Ingredient from './components/Ingredient';
import Units from './components/Units';
import Tags from './components/Tags';
import Tag from './components/Tag';
import Home from './components/Home';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';

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
      path: "recipes",
      element: <Recipes />
    }, {
      path: "recipes/create",
      element: <RecipeCreate />
    }, {
      path: "recipes/:recipeId",
      element: <Recipe />
    }, {
      path: "recipes/:recipeId/edit",
      element: <RecipeEdit />
    }, {
      path: "ingredients",
      element: <Ingredients />
    }, {
      path: "ingredients/:ingredientId",
      element: <Ingredient />
    }, {
      path: "units",
      element: <Units />
    },
    {
      path: "tags",
      element: <Tags />
    }, {
      path: "tags/:tagId",
      element: <Tag />
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
