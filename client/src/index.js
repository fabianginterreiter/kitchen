import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import Recipe from './components/Recipe';
import RecipeEdit from './components/RecipeEdit';
import Recipes from './components/Recipes';
import Ingredients from './components/Ingredients';
import Ingredient from './components/Ingredient';
import Units from './components/Units';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [{
      path: "recipes",
      element: <Recipes />
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
