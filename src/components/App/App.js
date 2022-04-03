import React, { useEffect, useRef, useState } from 'react';
import { randomNumBetweenExcluding } from '../../libs/helpers';
import Asteroid from '../Asteroid/Asteroid';
import Ship from '../Ship/Ship';

const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32,
};

const App = () => {
  const [screen, setScreen] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    ratio: window.devicePixelRatio || 1,
  });
  const contextRef = useRef();
  const [context, setContext] = useState();
  const [keys, setKeys] = useState({
    left: 0,
    right: 0,
    up: 0,
    down: 0,
    space: 0,
  });
  const [asteroidCount, setAsteroidCount] = useState(3);
  const [currentScore, setCurrentScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [entities, setEntities] = useState({
    ship: [],
    asteroids: [],
    bullets: [],
    particles: [],
  });

  useEffect(() => {
    const handleResize = () => {
      setScreen({
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      });
    };

    const handleKeys = (v, e) => {
      let tmpKeys = keys;
      if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) tmpKeys.left = v;
      if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) tmpKeys.right = v;
      if (e.keyCode === KEY.UP || e.keyCode === KEY.W) tmpKeys.up = v;
      if (e.keyCode === KEY.SPACE) tmpKeys.space = v;
      setKeys({
        ...tmpKeys,
      });
    };

    window.addEventListener('keyup', handleKeys.bind(this, false));
    window.addEventListener('keydown', handleKeys.bind(this, true));
    window.addEventListener('resize', handleResize);

    const currentContext = contextRef.current.getContext('2d');
    setContext(currentContext);
    startGame();
    requestAnimationFrame(() => {
      update();
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keyup', handleKeys);
      window.removeEventListener('keydown', handleKeys);
    };
  }, []);

  const update = () => {
    const canvas = contextRef.current.getContext('2d');
    canvas.save();
    canvas.scale(screen.ratio, screen.ratio);

    // Motion trail
    canvas.fillStyle = '#000';
    canvas.fillRect(0, 0, screen.width, screen.height);
    canvas.globalAlpha = 1;

    // Next set of asteroids
    if (!entities.asteroids.length) {
      let count = asteroidCount + 1;
      setAsteroidCount(count);
      generateAsteroids(count);
    }

    // Check for colisions
    checkCollisionsWith(entities.bullets, entities.asteroids);
    checkCollisionsWith(entities.ship, entities.asteroids);

    // Remove or render
    updateObjects(entities.particles, 'particles');
    updateObjects(entities.asteroids, 'asteroids');
    updateObjects(entities.bullets, 'bullets');
    updateObjects(entities.ship, 'ship');

    canvas.restore();

    // Next frame
    requestAnimationFrame(() => {
      update();
    });
  };

  const addScore = points => {
    setCurrentScore(prevScore => prevScore + points);
  };

  const startGame = () => {
    setIsPlaying(true);
    setCurrentScore(0);

    // Make ship
    let ship = new Ship({
      position: {
        x: screen.width / 2,
        y: screen.height / 2,
      },
      create: createObject,
      onDie: gameOver,
    });
    createObject(ship, 'ship');

    // Make asteroids
    entities.asteroids = [];
    generateAsteroids(asteroidCount);
  };

  const gameOver = () => {
    setIsPlaying(false);
  };

  const generateAsteroids = howMany => {
    let asteroids = [];
    let ship = entities.ship[0];
    for (let i = 0; i < howMany; i++) {
      let asteroid = new Asteroid({
        size: 80,
        position: {
          x: randomNumBetweenExcluding(
            0,
            screen.width,
            ship.position.x - 60,
            ship.position.x + 60
          ),
          y: randomNumBetweenExcluding(
            0,
            screen.height,
            ship.position.y - 60,
            ship.position.y + 60
          ),
        },
        create: createObject,
        addScore: addScore,
      });
      createObject(asteroid, 'asteroids');
    }
  };

  const createObject = (item, group) => {
    let arr = entities[group].push(item);
    setEntities({ ...entities, arr });
  };

  const updateObjects = (items, group) => {
    let index = 0;
    for (let item of items) {
      if (item.delete) {
        entities[group].splice(index, 1);
      } else {
        const state = {
          screen,
          context: contextRef.current.getContext('2d'),
          keys,
        };

        items[index].render(state);
      }
      index++;
    }
  };

  const checkCollisionsWith = (items1, items2) => {
    var a = items1.length - 1;
    var b;
    for (a; a > -1; --a) {
      b = items2.length - 1;
      for (b; b > -1; --b) {
        var item1 = items1[a];
        var item2 = items2[b];
        if (checkCollision(item1, item2)) {
          item1.destroy();
          item2.destroy();
        }
      }
    }
  };

  const checkCollision = (obj1, obj2) => {
    var vx = obj1.position.x - obj2.position.x;
    var vy = obj1.position.y - obj2.position.y;
    var length = Math.sqrt(vx * vx + vy * vy);
    if (length < obj1.radius + obj2.radius) {
      return true;
    }
    return false;
  };

  const determineMessage = () => {
    let endgame;
    let message = `Score: ${currentScore}`;

    if (!isPlaying) {
      endgame = (
        <div className='endgame'>
          <p className='md'>Game Over</p>
          <p className='md'>{message}</p>
          <button onClick={() => window.location.reload()}>Play again</button>
        </div>
      );
    }

    return endgame;
  };

  return (
    <div>
      {determineMessage()}
      <span className='score current-score'>{currentScore}</span>
      <canvas
        ref={contextRef}
        width={screen.width * screen.ratio}
        height={screen.height * screen.ratio}
      />
    </div>
  );
};

export default App;
