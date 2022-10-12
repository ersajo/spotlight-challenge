import axios from 'axios'
import React, { useState } from 'react'
import './LightItem.css';

export const LightItem = () => {
  const [distribution, setDistribution] = useState([]);
  const [result, setResult] = useState()
  const [size, setSize] = useState([0, 0])
  const [isVisible, setIsVisible] = useState(false)
  const colors = [
    'white',
    'black',
    'dark-yellow',
    'yellow',
  ]
  const descriptions = [
    'oscuridad',
    'pared',
    'foco',
    'luz',
  ]

  const handleRequest = () => {
    axios.post('http://localhost:4000/', { distribution }).then((res) => {
      setResult(res.data.solutions)
    });
  }

  const changeRows = (event) => {
    setSize([event.target.value, size[1]])
  }

  const changeCols = (event) => {
    setSize([size[0], event.target.value])
  }

  const setArray = () => {
    const newDistribution = []
    for (let row = 0; row < Number(size[0]); row++) {
      newDistribution.push([])
      for (let col = 0; col < Number(size[1]); col++) {
        newDistribution[row].push(0)
      }
    }
    setDistribution(newDistribution);
    setIsVisible(true);
  }

  const setWall = (row, col) => {
    const newDistribution = JSON.parse(JSON.stringify(distribution));
    if (newDistribution[row][col] === 0) newDistribution[row][col] = 1;
    else newDistribution[row][col] = 0;
    setDistribution(newDistribution)
  }

  return (
    <>
      <div className='flex justify-center items-center pb-4'>
        <div className='w-1/4 pt-6 pl-6'>
          <label className='block text-sm font-medium text-gray-700'>Renglones</label>
          <div className='relative mt-1 rounded-md shadow-sm'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
            </div>
            <input className='block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm' placeholder='Renglones' onChange={ e => changeRows(e) } value={ size[0] } />
          </div>
        </div>
        <div className='w-1/4 pt-6 pl-6'>
          <label className='block text-sm font-medium text-gray-700'>Columnas</label>
          <div className='relative mt-1 rounded-md shadow-sm'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
            </div>
            <input className='block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm' placeholder='Columnas' onChange={ e => changeCols(e) } value={ size[1] } />
          </div>
        </div>
        <button type="button" className="bg-lime-600 h-1/2 ml-6 p-2 rounded-lg text-white font-bold" onClick={e => setArray()}>Crear matriz</button>
      </div>
      {distribution && isVisible && (
        <>
          <span className="text-lg font-bold">
            Haz click para colocar o quitar una pared
          </span>
          {distribution.map((row, rowIndex) => 
            <div key={'row-' + rowIndex} className='flex w-full'>
              {row.map((col, colIndex) =>
                <div key={'col-' + colIndex} className={`flex w-full h-8 justify-center floor-${colors[col]} border`} onClick={e => setWall(rowIndex, colIndex)} >

                </div>
              )}
            </div>
          )}
          <button type="button" className="my-4 bg-lime-600 h-1/2 ml-6 p-2 rounded-lg text-white font-bold" onClick={e => handleRequest()}>Calcular</button>
        </>
      )}
      {result && (
        <div>
          <span className='text-2xl font-bold'>
            Soluciones
          </span>
          {result.map((solution, index) => 
            <div key={'solution-' + index}>
              <span className='font-bold text-lg'>
                Solución {index + 1} (Total focos: {solution.spotlights})
              </span>
              {solution.lightDistribution.map((row, rowIndex) => 
                <div key={'row-' + rowIndex} className='flex w-full'>
                  {row.map((col, colIndex) =>
                    <div key={'col-' + colIndex} className={`flex w-full h-8 justify-center floor-${colors[col]} border`}>
                      <span className={`text-${col === 1 ? 'white' : 'black'}`}>
                        {`${descriptions[col]}`}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
