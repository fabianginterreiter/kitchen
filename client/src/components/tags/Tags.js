import { Link } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import Modal from '../../ui/Modal.js';

const GET_TAGS = gql`query GetTags {
    tags { id, name }
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

    const { loading, error } = useQuery(GET_TAGS, {
        onCompleted: (data) => setTags(data.tags)
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div>
            <h1>Tags</h1>

            {tag ? <Modal visible={tag !== null} onClose={() => setTag(null)} onSave={() => {
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
            }} title={`Zutat ${tag.id ? "bearbeiten" : "erstellen"}`}>
                <label htmlFor="formName" className="form-label">Name</label>
                <input id="formName" type="text" placeholder="Name" value={tag.name} onChange={e => setTag({ ...tag, name: e.target.value })} />
            </Modal> : <div />}

            <button onClick={() => setTag({ name: "" })}>Erstellen</button>

            <table className="table">
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
                                <button onClick={() => setTag(tag)}>Edit</button>&nbsp;
                                <button onClick={() =>
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