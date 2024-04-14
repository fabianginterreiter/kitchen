import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';
import { Fragment } from "react";

const GET_RECIPE = gql`query GetRecipe($recipeId: ID!) {
    recipe(id: $recipeId) { id, name } 
}`;

function RecipeLink({ id }) {
    const { loading, error, data } = useQuery(GET_RECIPE, {
        variables: { recipeId: id }
    });

    if (loading || error) {
        return <Link to={`/recipes/${id}`}>Rezept({id})</Link>
    }

    return <Link to={`/recipes/${id}`}>{data.recipe.name}</Link>
}

const GET_TAG = gql`query GetTag($tagId: ID!) {
    tag(id: $tagId) { id, name }
  }`;

function TagLink({ id }) {
    const { loading, error, data } = useQuery(GET_TAG, {
        variables: { tagId: id }
    });

    if (loading || error) {
        return <Link to={`/tags/${id}`}>Tag({id})</Link>
    }

    return <Link to={`/tags/${id}`}>{data.tag.name}</Link>
}

const GET_INGREDIENT = gql`query GetIngredient($ingredientId: ID!) {
    ingredient(id: $ingredientId) { id, name, recipes { id, name } }
  }`;
function IngredientLink({ id }) {
    const { loading, error, data } = useQuery(GET_INGREDIENT, {
        variables: { ingredientId: id }
    });

    if (loading || error) {
        return <Link to={`/ingredients/${id}`}>Zutat({id})</Link>
    }

    return <Link to={`/ingredients/${id}`}>{data.ingredient.name}</Link>
}

export default function Text({ value }) {
    const regex = /\[\[(\w+)=(\d+)\]\]/gm;

    const v = value.split(regex);

    let r = [];
    let i = 0;
    while (i < v.length) {
        r.push(v[i++]);

        if (i < v.length) {
            const type = v[i++];
            const id = v[i++];

            switch (type) {
                case 'recipe': r.push(<RecipeLink id={id} />); break;
                case 'tag': r.push(<TagLink id={id} />); break;
                case 'ingredient': r.push(<IngredientLink id={id} />); break;
            }
        }
    }

    return <>{r.map((e, i) => <Fragment key={i}>{e}</Fragment>)}</>
}