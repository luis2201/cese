import React from 'react';
import Layout from './Layout';
import { getUserData } from '../services/apiService';

const logoEco = process.env.PUBLIC_URL + '/images/logo_eco.png';
const logoITSUP = process.env.PUBLIC_URL + '/images/logo_itsup.png';

const Dashboard = () => {
  const { nombres = 'Usuario', tipousuario = 'INVITADO' } = getUserData() || {};

  return (
    <Layout>
      {/* Contenedor central */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] space-y-8">
        {/* Texto principal */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-eco-700 mb-2">
            Panel principal
          </h1>
          <p className="text-muted">
            Hola <span className="font-bold uppercase">{nombres}</span> (
            <span className="uppercase">{tipousuario}</span>). Aquí verás un
            resumen del sistema CESE.
          </p>
        </div>

        {/* Logos */}
        <div className="flex items-center gap-10">
          <img
            src={logoEco}
            alt="Logo ECO"
            className="w-40 h-40 object-contain drop-shadow-lg"
          />
          <img
            src={logoITSUP}
            alt="Logo ITSUP"
            className="w-40 h-40 object-contain drop-shadow-lg"
          />
        </div>

        {/* Opciones rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mt-8">
          <div className="card text-center cursor-pointer hover:shadow-lg transition">
            Actas de recepción
          </div>
          <div className="card text-center cursor-pointer hover:shadow-lg transition">
            Actas de entrega
          </div>
          <div className="card text-center cursor-pointer hover:shadow-lg transition">
            Estudiantes inscritos
          </div>
          <div className="card text-center cursor-pointer hover:shadow-lg transition">
            Equipos en revisión
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
