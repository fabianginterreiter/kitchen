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
  }
}`;


export default function Lists() {
  const { loading, error, data } = useQuery(GET_LISTS);

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <h1>Lists</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {data.lists.map((list) => <tr key={list.id}>
            <td><Link to={`/lists/${list.id}`}>{list.name}</Link></td>
            <td>{list.startDate}</td>
            <td>{list.endDate}</td>
          </tr>)}
        </tbody>
      </table>
    </div >
  );
};