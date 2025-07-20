import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/Table.css';

const Table = ({ columns, data }) => {
    return (
        <div className="table-responsive">
            <table className="table table-dark table-striped table-hover">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center">Tidak ada data</td>
                        </tr>
                    ) : (
                        data.map((row, index) => (
                            <tr key={index}>
                                {columns.map((col, i) => (
                                    <td key={i}>{row[col.key]}</td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
