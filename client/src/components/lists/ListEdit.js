import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import ListForm from './ListForm.js';
import { useTranslation } from 'react-i18next';

const GET_LIST = gql`
query GetLIst($listId: ID!) {
  list(id: $listId) { id, name, description, closed, entries { id, portions, date, recipe_id } }
}`;

const UPDATE_LIST = gql`mutation Mutation($list: ListInput) {
    updateList(list: $list) {
        id, name, description, closed, entries { id, portions, date, recipe_id }
    }
  }`;


export default function List() {
    const { t } = useTranslation();
    const { listId } = useParams();

    const [list, setList] = useState(null);

    const navigate = useNavigate();

    const [updateList] = useMutation(UPDATE_LIST);

    const { loading, error } = useQuery(GET_LIST, {
        variables: { listId }, onCompleted: (data) => {
            setList(data.list);
        }
    });

    if (loading || !list) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<ListForm
        onClose={() => navigate(`/lists/${list.id}`)}
        onChange={(list) => setList(list)}
        onSaveAndClose={(list) => updateList({
            variables: { list }, onCompleted: (data) => {
                navigate(`/lists/${list.id}`)
            }
        })}
        onSave={(list, cb) => updateList({
            variables: { list }, onCompleted: (data) => {
                setList(data.updateList);
                cb();
            }
        })}
        list={list} />);
};