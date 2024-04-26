import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../../ui/Utils.js';
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import Modal from '../../../ui/Modal.js';
import useDialog from '../../../ui/Dialog.js';

const GET_UNITS = gql`query GetUnits {
    units {id,name,description}
  }`;

const CREATE_UNIT = gql`mutation Mutation($unit: UnitInput) {
    createUnit(unit: $unit) { id, name, description }
  }`;

const UPDATE_UNIT = gql`mutation Mutation($unit: UnitInput) {
    updateUnit(unit: $unit) { id, name, description }
  }`;


const DELETE_UNIT = gql`mutation Mutation($unit: UnitInput) {
    deleteUnit(unit: $unit)
}`;

export default function Units() {
    const { t } = useTranslation();
    const dialog = useDialog();

    const [unit, setUnit] = useState(null);
    const [units, setUnits] = useState([]);

    const [createUnit] = useMutation(CREATE_UNIT);
    const [updateUnit] = useMutation(UPDATE_UNIT);
    const [deleteUnit] = useMutation(DELETE_UNIT);

    const { loading, error } = useQuery(GET_UNITS, {
        onCompleted: (data) => {
            setUnits(data.units);
        }
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (<div className="App">
        <h1>{t('options.units')}</h1>
        {dialog.render}

        {unit ? <Modal visible={unit !== null} onClose={() => setUnit(null)} onSave={() => {
            if (unit.id) {
                updateUnit({
                    variables: { unit: { id: unit.id, name: unit.name, description: unit.description } },
                    onCompleted: (data) => {
                        setUnits(units.map((u) => (u.id === data.updateUnit.id) ? data.updateUnit : u));
                        setUnit(null);
                    }
                })
            } else {
                createUnit({
                    variables: {
                        unit
                    },
                    onCompleted: (data) => {
                        setUnits([...units, data.createUnit]);
                        setUnit(null);
                    }
                })
            }

            setUnit(null)
        }} title={`${t('options.units.form.title')} ${unit.id ? t('options.units.form.title.edit') : t('options.units.form.title.create')}`}>
            <label htmlFor="formName" className="form-label">{t('options.units.form.name')}</label>
            <input id="formName" type="text" className="form-control" placeholder={t('options.units.form.name')} value={unit.name} onChange={e => setUnit({ ...unit, name: e.target.value })} />
            <label htmlFor="formDescription" className="form-label">{t('options.units.form.description')}</label>
            <input id="formDescription" type="text" className="form-control" placeholder={t('options.units.form.description')} value={unit.description} onChange={e => setUnit({ ...unit, description: e.target.value })} />
        </Modal> : <div />}

        <button className="btn btn-primary" onClick={() => setUnit({ name: "", description: "" })}>{t('options.units.create')}</button>

        <table className="table table-striped">
            <thead>
                <tr>
                    <th>{t('options.units.table.name')}</th>
                    <th>{t('options.units.table.description')}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {units.map(unit => <tr key={unit.id}>
                    <td>{unit.name}</td>
                    <td>{unit.description}</td>
                    <td>
                        <button className="btn btn-primary" onClick={() => setUnit(unit)}>{t('button.edit')}</button>&nbsp;
                        <button className="btn btn-danger" onClick={() => dialog.confirm(t('options.units.table.delete.confirm', { unit: unit.name })).then((value) => {
                            if (value) {
                                deleteUnit({
                                    variables: {
                                        unit: { id: unit.id, name: unit.name, description: unit.description }
                                    }, onCompleted: (data) =>
                                        setUnits(units.filter((u) => u.id !== unit.id)),
                                    onError: (error) => {
                                        console.log(error)
                                        dialog.alert("In USE!");
                                    }
                                })
                            }
                        })}>{t('button.delete')}</button></td>
                </tr>)}
            </tbody>
        </table>
    </div>);
};