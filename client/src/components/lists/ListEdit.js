import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import ListForm from './ListForm.js';

const GET_LIST = gql`
query GetLIst($listId: ID!) {
  list(id: $listId) { id, name, startDate, endDate, entries { id, portions, date, recipe_id } }
}`;

const UPDATE_LIST = gql`mutation Mutation($list: ListInput) {
    updateList(list: $list) {
        id, name, startDate, endDate, entries { id, portions, date, recipe_id }
    }
  }`;


export default function List() {
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
        onSave={(list) => updateList({
            variables: { list }, onCompleted: (data) => {
                setList(data.updateList);
            }
        })}
        list={list} />);
};