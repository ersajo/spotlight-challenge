const POPULATION_SIZE = 20;
const GENERATIONS = 10;
const nonValidFields = [1, 2];

// Coordinates given in [row, column].
const getSpaces = (columns, rows) => columns * rows;

const getWalls = (distribution) => distribution.reduce((total, row) => {
  const walls = row.reduce((sum, current) => current === 1 ? sum + 1 : sum, 0)
  return walls + total;
}, 0);

const cloneArray = (array) => JSON.parse(JSON.stringify(array));

const getRandomInt = (max) => Math.floor(Math.random() * max);

const setSpotlights = (data) => {
  const {
    distribution,
    columns,
    rows,
    spotlights
  } = data;
  let lightDistribution = cloneArray(distribution);
  for (let lightCounter = 0; lightCounter < spotlights; lightCounter++) {
    let retry = 5;
    while (retry > 0) {
      const lightCoord = {
        x: getRandomInt(rows),
        y: getRandomInt(columns)
      }
      const actualValue = lightDistribution[lightCoord.x][lightCoord.y]
      if (!nonValidFields.includes(actualValue)) {
        lightDistribution = setLights({
          row: lightCoord.x,
          column: lightCoord.y,
          lightDistribution
        });
        break;
      }
      retry--;
    }
  }
  return lightDistribution;
}

const setLights = (data) => {
  const {
    column,
    row,
  } = data;
  let { lightDistribution } = data;
  
  lightDistribution[row][column] = 2;
  for (let xIndex = row; xIndex < lightDistribution.length - 1; xIndex++) {
    let actualValue = lightDistribution[xIndex + 1][column];
    if (actualValue === 1) break;
    lightDistribution[xIndex + 1][column] = actualValue === 0 ? 3 : actualValue;
  }
  for (let xIndex = row; xIndex > 0; xIndex--) {
    let actualValue = lightDistribution[xIndex - 1][column];
    if (actualValue === 1) break;
    lightDistribution[xIndex - 1][column] = actualValue === 0 ? 3 : actualValue;
  }

  for (let yIndex = column; yIndex < lightDistribution[row].length - 1; yIndex++) {
    let actualValue = lightDistribution[row][yIndex + 1];
    if (actualValue === 1) break;
    lightDistribution[row][yIndex + 1] = actualValue === 0 ? 3 : actualValue;
  }
  for (let yIndex = column; yIndex > 0; yIndex--) {
    let actualValue = lightDistribution[row][yIndex - 1];
    if (actualValue === 1) break;
    lightDistribution[row][yIndex - 1] = actualValue === 0 ? 3 : actualValue;
  }
  return lightDistribution;
}

const getLighted = (lightDistribution) => lightDistribution.reduce((total, row) => {
    const lighted = row.reduce((sum, current) => current === 3 ? sum + 1 : sum, 0)
    return lighted + total;
  }, 0);

const getCoverage = (distribution, createNew = true) => {
  return new Promise((resolve) => {
    const [rows, columns] = getSize(distribution);
    const spaces = getSpaces(columns, rows);
    const walls = getWalls(distribution);
    let spotlights;
    
    while (true && createNew) {
      spotlights = getRandomInt(spaces - walls)
      if(spotlights > 0 && spotlights < spaces - walls) break;
    }
    
    spotlights = createNew ? spotlights : getSpotlights(distribution);
    
    const lightDistribution = setSpotlights({
      distribution,
      columns,
      rows,
      spotlights
    });

    spotlights = getSpotlights(lightDistribution);

    const availableSlots = (spaces - walls - spotlights)
    const lighted = getLighted(lightDistribution);

    const coverage = parseFloat(lighted/availableSlots);
    const available = parseFloat(availableSlots/(spaces - walls));
    const totalFree = 1 - parseFloat((walls+spotlights+lighted) / spaces);
    const totalCoverage = 1 - parseFloat(coverage * available * totalFree);
    resolve({
      spaces, 
      walls,
      spotlights,
      lighted,
      coverage: totalCoverage,
      lightDistribution
    })
  });
}

const sortDistribution = (data) => {
  data.sort((a, b) => {
    const n = b.coverage - a.coverage;
    if (n !== 0) {
      return n;
    }
    return a.spotlights - b.spotlights;
  });
  return data;
}

const setFirstGeneration = (distribution) => {
  return new Promise(async (resolve) => {
    const promises = [];
    for (let index = 0; index < POPULATION_SIZE; index++) {
      promises.push(getCoverage(distribution))
    }
    let data = await Promise.all(promises);
    data = sortDistribution(data);
    resolve(data);
  });
}

const crossover = (parent, mother) => {
  const [rows, columns] = getSize(parent.lightDistribution);
  let crossCoord= {
    x: getRandomInt(rows),
    y: getRandomInt(columns)
  };
  while(true) {
    if (crossCoord.x > 0 && crossCoord.y > 0) break;
    if (crossCoord.x === 0) crossCoord.x = getRandomInt(rows);
    if (crossCoord.y === 0) crossCoord.y = getRandomInt(columns);
  }
  const newChild = cloneArray(parent);
  for (let xIterator = 0; xIterator <= crossCoord.x; xIterator++) {
    for (let yIterator = crossCoord.y; yIterator < newChild.lightDistribution[xIterator].length; yIterator++) {
      newChild.lightDistribution[xIterator][yIterator] = mother.lightDistribution[xIterator][yIterator];
    }
  }
  for (let xIterator = crossCoord.x + 1; xIterator < newChild.lightDistribution.length; xIterator++) {
    for (let yIterator = 0; yIterator < crossCoord.y; yIterator++) {
      newChild.lightDistribution[xIterator][yIterator] = mother.lightDistribution[xIterator][yIterator];
    }
  }
  return newChild;
}

const runGeneration = (generation, originalDistribution, iteration, cb) => {
  if (iteration === 0) return generation;
  return new Promise(async (resolve) => {
    let newGeneration = cloneArray(generation);
    newGeneration = shuffle(newGeneration);
    for (let index = 0; index < (POPULATION_SIZE/2) - 1; index++) {
      let child = crossover(newGeneration[index], newGeneration[index + 1]);
      child = await getCoverage(child.lightDistribution, false);
      newGeneration.push(child);
    }
    for (let index = newGeneration.length; index < POPULATION_SIZE; index++) {
      const child = await getCoverage(originalDistribution);
      newGeneration.push(child);
    }
    newGeneration = sortDistribution(newGeneration);
    resolve(cb(newGeneration, originalDistribution, iteration - 1, cb));
  });
}

const shuffle = (array) => {
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const getSpotlights = (distribution) => distribution.reduce((total, row) => {
  const spotlights = row.reduce((sum, current) => current === 2 ? sum + 1 : sum, 0)
  return spotlights + total;
}, 0);

const getSize = (distribution) => [distribution.length, distribution[0].length]

const run = async (req, res) => {
  const { distribution } = req.body
  let generation = GENERATIONS;
  let data = await setFirstGeneration(distribution);
  data = await runGeneration(data.slice(0, POPULATION_SIZE/2), distribution, generation, runGeneration)
  data = data.filter((distribution) => distribution.coverage === 1);
  res
    .status(201)
    .json({ solutions: data });
}

module.exports = {
  run
};