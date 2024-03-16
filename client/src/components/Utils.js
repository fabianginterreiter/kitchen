export function Loading() {
    return (<div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
    </div>);
}

export function Error(args) {
    return (<p>Error : {args.message}</p>);
}