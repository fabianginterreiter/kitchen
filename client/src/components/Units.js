import { Link } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from './Utils.js';
import { useState } from "react";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const GET_UNITS = gql`query GetUnits {
    units {
      id
      name
      description
    }
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
    const [unit, setUnit] = useState(null);
    const [units, setUnits] = useState([]);

    const [createUnit] = useMutation(CREATE_UNIT);
    const [updateUnit] = useMutation(UPDATE_UNIT);
    const [deleteUnit] = useMutation(DELETE_UNIT);

    const { loading, error, data } = useQuery(GET_UNITS, {
        onCompleted: (data) => {
            setUnits(data.units);
        }
    });

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div className="App">
            <h1>Einheiten</h1>
            <hr />

            {unit !== null ? <Modal show={true} onHide={() => setUnit(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Einheit {unit.id ? "bearbeiten" : "erstellen"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label htmlFor="formName" className="form-label">Name</label>
                    <input id="formName" type="text" className="form-control" placeholder="Name" value={unit.name} onChange={e => setUnit({ ...unit, name: e.target.value })} />
                    <label htmlFor="formDescription" className="form-label">Beschreibung</label>
                    <input id="formDescription" type="text" className="form-control" placeholder="Beschreibung" value={unit.description} onChange={e => setUnit({ ...unit, description: e.target.value })} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setUnit(null)}>
                        Abbrechen
                    </Button>
                    <Button variant="primary" onClick={() => {
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
                    }}>Speichern</Button>
                </Modal.Footer>
            </Modal> : <div />}

            <button className="btn btn-primary" onClick={() => setUnit({ name: "", description: "" })}>Erstellen</button>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Beschreibung</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {units.map(unit =>
                        <tr key={unit.id}>
                            <td>{unit.name}</td>
                            <td>{unit.description}</td>
                            <td>
                                <button className="btn btn-primary" onClick={() => setUnit(unit)}>Edit</button>&nbsp;
                                <button className="btn btn-danger" onClick={() =>
                                    deleteUnit({
                                        variables: {
                                            unit: { id: unit.id, name: unit.name, description: unit.description }
                                        }, onCompleted: (data) =>
                                            setUnits(units.filter((u) => u.id !== unit.id)),
                                            onError: (error) => {
                                                console.log(error)
                                                alert("In USE!");
                                            }
                                    })}>Delete</button></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};