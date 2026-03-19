import { Link } from 'react-router-dom';

export default function Breadcrumbs({ paths }) {
    return (
        <div className="gallery-breadcrumbs">
            {paths.map((path, index) => (
                <span key={index} className="breadcrumb-item">
                    {path.url ? (
                        <>
                            <Link to={path.url} className="breadcrumb-link">{path.label}</Link>
                            <span className="breadcrumb-separator">/</span>
                        </>
                    ) : (
                        <span className="breadcrumb-current">{path.label}</span>
                    )}
                </span>
            ))}
        </div>
    );
}
