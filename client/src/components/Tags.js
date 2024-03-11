import { Link } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from './Utils.js';
import { useState } from "react";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const GET_TAGS = gql`query GetTags {
    tags {
      id
      name
    }
  }`;

const CREATE_TAG = gql`mutation Mutation($tag: TagInput) {
    createTag(tag: $tag) { id, name }
  }`;

const UPDATE_TAG = gql`mutation Mutation($tag: TagInput) {
    updateTag(tag: $tag) { id, name }
  }`;


const DELETE_TAG = gql`mutation Mutation($tag: TagInput) {
    deleteTag(tag: $tag)
}`;

export default function Tags() {
    const [tag, setTag] = useState(null);
    const [tags, setTags] = useState([]);

    const [createTag] = useMutation(CREATE_TAG);
    const [updateTag] = useMutation(UPDATE_TAG);
    const [deleteTag] = useMutation(DELETE_TAG);

    const { loading, error, data } = useQuery(GET_TAGS, {
        onCompleted: (data) => setTags(data.tags)
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div>
            <h1>Zutaten</h1>
            <hr />

            {tag !== null ? <Modal show={true} onHide={() => setTag(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Zutat {tag.id ? "bearbeiten" : "erstellen"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label htmlFor="formName" className="form-label">Name</label>
                    <input id="formName" type="text" className="form-control" placeholder="Name" value={tag.name} onChange={e => setTag({ ...tag, name: e.target.value })} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setTag(null)}>
                        Abbrechen
                    </Button>
                    <Button variant="primary" onClick={() => {
                        if (tag.id) {
                            updateTag({
                                variables: { tag: { id: tag.id, name: tag.name } },
                                onCompleted: (data) => {
                                    setTags(tags.map((u) => (u.id === data.updateTag.id) ? data.updateTag : u));
                                    setTag(null);
                                }
                            })
                        } else {
                            createTag({
                                variables: {
                                    tag
                                },
                                onCompleted: (data) => {
                                    setTags([...tags, data.createTag]);
                                    setTag(null);
                                }
                            })
                        }

                        setTag(null)
                    }}>Speichern</Button>
                </Modal.Footer>
            </Modal> : <div />}

            <button className="btn btn-primary" onClick={() => setTag({ name: "" })}>Erstellen</button>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Verwendungen</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {tags.map(tag =>
                        <tr key={tag.id}>
                            <td><Link to={`/tags/${tag.id}`}>{tag.name}</Link></td>
                            <td>{tag.usages}</td>
                            <td>
                                <button className="btn btn-primary" onClick={() => setTag(tag)}>Edit</button>&nbsp;
                                <button className="btn btn-danger" onClick={() =>
                                    deleteTag({
                                        variables: {
                                            tag: { id: tag.id, name: tag.name }
                                        }, onCompleted: (data) =>
                                            setTags(tags.filter((u) => u.id !== tag.id)),
                                        onError: (error) => {
                                            console.log(error)
                                            alert("In USE!");
                                        }
                                    })} disabled={tag.usages > 0}>Delete</button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div >
    );
};