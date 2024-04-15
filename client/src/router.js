import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import App from './App';
import { Outlet } from "react-router-dom";
import Recipe from './components/recipes/Recipe';
import Cooking from './components/recipes/cooking/Cooking';
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
import Lists from './components/lists/Lists';
import List from './components/lists/List';
import ListIngredients from './components/lists/Ingredients';
import ListCreate from './components/lists/ListCreate';
import ListEdit from './components/lists/ListEdit';

const router = createBrowserRouter([{
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
        children: [{
            index: true,
            element: <Recipes />,
        }, {
            path: "create",
            element: <RecipeCreate />
        }, {
            path: ":recipeId",
            children: [{
                index: true,
                element: <Recipe />,
            }, {
                path: "edit",
                element: <RecipeEdit />
            }, {
                path: "cooking",
                element: <Cooking />
            }]
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
    }, {
        path: "lists",
        element: <Outlet />,
        children: [{
            index: true,
            element: <Lists />
        },
        { path: "create", element: <ListCreate /> },

        {
            path: ":listId",
            children: [
                { index: true, element: <List /> },
                { path: "edit", element: <ListEdit /> },
                { path: "ingredients", element: <ListIngredients /> }
            ]
        },]
    }]
}]);

export default router;