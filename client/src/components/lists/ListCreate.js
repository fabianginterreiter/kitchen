import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, gql } from '@apollo/client';
import { Loading, Error } from '../../ui/Utils.js';
import { useState } from "react";
import ListForm from './ListForm.js';

const CREATE_LIST = gql`mutation Mutation($list: ListInput) {
    createList(list: $list) {
        id
    }
  }`;

const parseDate = (date) => {
    return date.toISOString().split('T')[0];
};

function getDateWeek(date) {
    const currentDate =
        (typeof date === 'object') ? date : new Date();
    const januaryFirst =
        new Date(currentDate.getFullYear(), 0, 1);
    const daysToNextMonday =
        (januaryFirst.getDay() === 1) ? 0 :
            (7 - januaryFirst.getDay()) % 7;
    const nextMonday =
        new Date(currentDate.getFullYear(), 0,
            januaryFirst.getDate() + daysToNextMonday);

    return (currentDate < nextMonday) ? 52 :
        (currentDate > nextMonday ? Math.ceil(
            (currentDate - nextMonday) / (24 * 3600 * 1000) / 7) : 1);
}



export default function List() {

    const [searchParams, setSearchParams] = useSearchParams();

    const [list, setList] = useState(() => {
        const result = {
            name: "",
            portions: 2,
            closed: false,
            entries: []
        };

        if (searchParams.get('template') === "week") {
            let startDate = null;
            if (searchParams.get('startDate')) {
                startDate = new Date(searchParams.get('startDate'));
            } else {
                let today = new Date();
                today.setDate(today.getDate() + 7 - today.getDay() + 1);
                startDate = today;
            }

            result.name = "Wochenplan " + startDate.getFullYear() + " KW " + getDateWeek(startDate);

            let endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);

            for (var i = 0; i < endDate.getDate() - startDate.getDate(); i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);

                result.entries.push({
                    id: null,
                    portions: 2,
                    date: parseDate(date),
                    recipe_id: null
                })
            }
        }

        return result;
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