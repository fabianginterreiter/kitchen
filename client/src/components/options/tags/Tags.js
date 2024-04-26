import { Link } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../../ui/Utils.js';
import { useState } from "react";
import Modal from '../../../ui/Modal.js';
import { useTranslation } from 'react-i18next';
import useDialog from '../../../ui/Dialog.js';

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
    const { t } = useTranslation();

    const dialog = useDialog();

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

    return (<div>
        <h1>{t('options.tags')}</h1>

        {dialog.render}

        {tag && <Modal visible={tag !== null} onClose={() => setTag(null)} onSave={() => {
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
        }} title={`${t('options.tags.modal.title')} ${tag.id ? t('options.tags.modal.title.edit') : t('options.tags.modal.title.create')}`}>
            <label htmlFor="formName" className="form-label">{t('options.tags.modal.name')}</label>
            <input id="formName" type="text" placeholder={t('options.tags.modal.name')} value={tag.name} onChange={e => setTag({ ...tag, name: e.target.value })} />
        </Modal>}

        <button onClick={() => setTag({ name: "" })}>{t('options.tags.create')}</button>

        <table>
            <thead>
                <tr>
                    <th>{t('options.tags.table.name')}</th>
                    <th>{t('options.tags.table.options')}</th>
                </tr>
            </thead>
            <tbody>
                {tags.map(tag => <tr key={tag.id}>
                    <td><Link to={`/tags/${tag.id}`}>{tag.name}</Link></td>
                    <td>
                        <button onClick={() => setTag(tag)}>{t('button.edit')}</button>&nbsp;
                        <button onClick={() => dialog.confirm(t('options.tags.table.delete.confirm', { tag: tag.name })).then((value) => {
                            if (value) {
                                deleteTag({
                                    variables: {
                                        tag: { id: tag.id, name: tag.name }
                                    }, onCompleted: (data) =>
                                        setTags(tags.filter((u) => u.id !== tag.id))
                                })
                            }
                        })}>{t('button.delete')}</button>
                    </td>
                </tr>)}
            </tbody>
        </table>
    </div>);
};