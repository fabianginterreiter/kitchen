import { Link } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import Modal from '../../ui/Modal.js';

const GET_LISTS = gql`
query Recipes {

  lists {
    id
    name
    startDate
    endDate
    entries {
      id
      portions
      recipe {
        name
        id
      }
    }
  }
}`;


export default function Lists() {
    const { loading, error, data } = useQuery(GET_LISTS);

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div>
            <h1>Lists</h1>
            <ul>
                {data.lists.map((list) => <li key={list.id}><Link to={`/lists/${list.id}`}>{list.id}</Link></li>)}
            </ul>
        </div >
    );
};