import './Collapse.css';

export default function Collapse({ visible, children }) {
    return (<div className={'Collapse' + (visible ? ' visible' : '')}>{children}</div>);
}