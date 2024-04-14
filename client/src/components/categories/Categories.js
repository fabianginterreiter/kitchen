import { useQuery, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import Recipes from '../../ui/Recipes.js';

const GET_CATEGORIES = gql`query GetCategories {
    categories(includeUncategorized:true) {id,name, recipes {id, name}}
  }`;

export default function Categories() {
    const { loading, error, data } = useQuery(GET_CATEGORIES);

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div>
        <h1>Kategorien</h1>

        {data.categories.map((category) => <>
            <h2>{(category.id === "0" ? "Unkategorisiert" : category.name)}</h2>
            <Recipes recipes={category.recipes} />
        </>)}
    </div>);
};