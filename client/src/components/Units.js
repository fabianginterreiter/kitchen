import { Link } from "react-router-dom";
import { useQuery, gql } from '@apollo/client';

const GET_UNITS = gql`query GetUnits {
    units {
      id
      name
      description
    }
  }`;

export default function Units() {
    const { loading, error, data } = useQuery(GET_UNITS);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    return (
        <div className="App">
            <h1>Units</h1>
            <table>
                <thead>
                    <tr><th>Name</th><th>Beschreibung</th></tr>
                </thead>
                <tbody>
                    {data.units.map(unit =>
                        <tr key={unit.id}><td>{unit.name}</td><td>{unit.description}</td></tr>
                    )}
                </tbody>
            </table>

        </div>
    );
};