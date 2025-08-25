import React from 'react';
import Layout from './Layout';
import { getUserData } from '../services/apiService';

const Dashboard = () => {
    const { nombres = 'Usuario', tipousuario = 'INVITADO' } = getUserData() || {};

    return (
        <Layout>
            <section className="dashboard">
                <h1 className="h1">Panel principal</h1>
                <p>Hola <strong>{nombres}</strong> (<em>{tipousuario}</em>). Aquí verás un resumen del sistema CESE.</p>

                {/* Ejemplo: tarjetas rápidas */}
                <div className="grid">
                    <div className="card">Actas de recepción</div>
                    <div className="card">Actas de entrega</div>
                    <div className="card">Estudiantes inscritos</div>
                    <div className="card">Equipos en revisión</div>
                </div>
            </section>
        </Layout>
    );
};

export default Dashboard;
