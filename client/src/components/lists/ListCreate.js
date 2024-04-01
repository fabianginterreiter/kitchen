import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import ListForm from './ListForm.js';

const CREATE_LIST = gql`mutation Mutation($list: ListInput) {
    createList(list: $list) {
        id, name, startDate, endDate, entries { id, portions, date, recipe_id }
    }
  }`;


export default function List() {
    const [list, setList] = useState({
        name: null,
        portions: 2,
        startDate: null,
        endDate: null,
        entries: []
    });

    const navigate = useNavigate();

    const [createList] = useMutation(CREATE_LIST);

    return (<ListForm
        onClose={() => navigate(`/lists`)}
        onChange={(list) => setList(list)}
        onSaveAndClose={(list) => createList({
            variables: { list }, onCompleted: (data) => {
                navigate(`/lists/${data.createList.id}`)
            }
        })}
        onSave={(list) => createList({
            variables: { list }, onCompleted: (data) => {
                navigate(`/lists/${data.createList.id}/edit`)
            }
        })}
        list={list} />);
};