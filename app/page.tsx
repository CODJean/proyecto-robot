'use client'

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [robotData, setRobotData] = useState({ 
    posX: 0, 
    posY: 0, 
    angulo: 0,
    energia: 100, 
    tiempo: 0, 
    distanciaFrontal: 0,
    distanciaDerecha: 0,
    distanciaTrasera: 0,
    distanciaIzquierda: 0,
    distanciaLaser: 0,
    estado: 'descansando',
    mapa: [],
    regresando: false
  });
  const [mapData, setMapData] = useState({ labels: [], datasets: [] });
  const [limites, setLimites] = useState({ xMin: -Infinity, xMax: Infinity, yMin: -Infinity, yMax: Infinity });

  useEffect(() => {
    const q = query(collection(db, 'robot_data'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newData = snapshot.docs[0]?.data();
      if (newData) {
        setRobotData(newData);
        
        setMapData({
          labels: newData.mapa.map((_, index) => index),
          datasets: [
            {
              label: 'Mapa de la habitación',
              data: newData.mapa.map(p => ({ x: p.x, y: p.y })),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              pointRadius: 3,
            },
            {
              label: 'Posición del robot',
              data: [{ x: newData.posX, y: newData.posY }],
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              pointRadius: 5,
            },
            {
              label: 'Límites del área',
              data: [
                { x: limites.xMin, y: limites.yMin },
                { x: limites.xMax, y: limites.yMin },
                { x: limites.xMax, y: limites.yMax },
                { x: limites.xMin, y: limites.yMax },
                { x: limites.xMin, y: limites.yMin },
              ],
              borderColor: 'rgb(255, 159, 64)',
              backgroundColor: 'rgba(255, 159, 64, 0.2)',
              pointRadius: 0,
              fill: true,
            }
          ]
        });
      }
    });

    return () => unsubscribe();
  }, [limites]);

  const enviarComando = async (comando) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/robot-command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comando }),
      });
      if (!response.ok) throw new Error('Error al enviar comando');
      
      if (comando === 'detener') {
        const { xMin, xMax, yMin, yMax } = await response.json();
        setLimites({ xMin, xMax, yMin, yMax });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Control del Robot</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Estado del Robot</h2>
          {robotData.regresando && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
              <p className="font-bold">Atención</p>
              <p>El robot está regresando a la base debido a batería baja.</p>
            </div>
          )}
          <p>Posición X: {robotData.posX.toFixed(2)}</p>
          <p>Posición Y: {robotData.posY.toFixed(2)}</p>
          <p>Ángulo: {robotData.angulo.toFixed(2)}°</p>
          <p>Energía: {robotData.energia}%</p>
          <p>Tiempo operando: {robotData.tiempo} segundos</p>
          <p>Estado: {robotData.estado}</p>
          <h3 className="text-lg font-semibold mt-4 mb-2">Distancias (cm)</h3>
          <p>Frontal: {robotData.distanciaFrontal}</p>
          <p>Derecha: {robotData.distanciaDerecha}</p>
          <p>Trasera: {robotData.distanciaTrasera}</p>
          <p>Izquierda: {robotData.distanciaIzquierda}</p>
          <p>Láser: {robotData.distanciaLaser}</p>
          
          <div className="mt-4">
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
              onClick={() => enviarComando('iniciar')}
              disabled={robotData.regresando}
            >
              Iniciar
            </button>
            <button 
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={() => enviarComando('detener')}
            >
              Delimitar Área
            </button>
            <button 
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={() => enviarComando('regresar')}
            >
              Regresar
            </button>
            <button 
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              onClick={() => enviarComando('mapear')}
              disabled={robotData.regresando}
            >
              Mapear
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Mapa de la Habitación</h2>
          <div style={{ height: '400px' }}>
            <Line 
              data={mapData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  x: {
                    type: 'linear' as const,
                    position: 'bottom' as const,
                  },
                  y: {
                    type: 'linear' as const,
                    position: 'left' as const,
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

