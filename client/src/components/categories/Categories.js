import { useQuery, gql } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { Loading, Error } from '../../ui/Utils.js';
import Recipes from '../../ui/Recipes.js';

const GET_CATEGORIES = gql`query GetCategories {
    categories(includeUncategorized:true) {id,name, recipes {id, name}}
  }`;

export default function Categories() {
    const { t } = useTranslation();
    const { loading, error, data } = useQuery(GET_CATEGORIES);

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div>
        <h1>{t('categories')}</h1>

        {data.categories.map((category) => <>
            <h2>{(category.id === "0" ? t('categories.uncategorized') : category.name)}</h2>
            <Recipes recipes={category.recipes} />
        </>)}
    </div>);
};