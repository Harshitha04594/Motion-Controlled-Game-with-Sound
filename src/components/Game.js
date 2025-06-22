import React, { useEffect, useRef, useState } from "react";

const powerupSound = new Audio(process.env.PUBLIC_URL + "/sounds/powerup.mp3");
const hitSound = new Audio(process.env.PUBLIC_URL + "/sounds/hit.mp3");
const gameOverSound = new Audio(process.env.PUBLIC_URL + "/sounds/gameover.mp3");

const Game = () => {
  const canvasRef = useRef(null);
  const player = useRef({ x: 300, y: 400 });
  const obstacles = useRef([{ x: 300, y: 0 }]);
  const powerUps = useRef([]);
  const enemies = useRef([]);
  const speed = useRef(4);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [slowMotion, setSlowMotion] = useState(false);
  const [bgColor, setBgColor] = useState("white");

  useEffect(() => {
    const handleKeyDown = (e) => {
      const step = 15;
      if (e.key === "ArrowLeft") player.current.x -= step;
      if (e.key === "ArrowRight") player.current.x += step;
      if (e.key === "ArrowUp") player.current.y -= step;
      if (e.key === "ArrowDown") player.current.y += step;
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    let animationId;

    const draw = () => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Player (🧍‍♂️)
      ctx.font = "30px Arial";
      ctx.fillText(shieldActive ? "🛡️" : "🧍‍♂️", player.current.x, player.current.y);

      // Obstacles (💣)
      obstacles.current.forEach((o) => {
        ctx.fillText("💣", o.x, o.y);
      });

      // Enemies (👹)
      enemies.current.forEach((e) => {
        ctx.fillText("👹", e.x, e.y);
      });

      // Power-Ups
      powerUps.current.forEach((p) => {
        const emoji =
          p.type === "bonus" ? "🎁" : p.type === "shield" ? "🛡️" : "🐢";
        ctx.fillText(emoji, p.x, p.y);
      });

      // Score
      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      ctx.fillText(`Score: ${score}`, 20, 40);
    };

    const update = () => {
      const step = slowMotion ? 2 : speed.current;

      // Move everything
      obstacles.current.forEach((o) => (o.y += step));
      powerUps.current.forEach((p) => (p.y += step));
      enemies.current.forEach((e) => (e.y += step + 1));

      // Clean up off-screen & respawn
      obstacles.current = obstacles.current.filter((obs) => {
        if (obs.y > window.innerHeight) {
          obs.y = 0;
          obs.x = Math.random() * window.innerWidth;
          setScore((s) => s + 1);

          // Add power-up chance
          if (Math.random() < 0.2) {
            const type = ["bonus", "shield", "slow"][Math.floor(Math.random() * 3)];
            powerUps.current.push({
              x: Math.random() * window.innerWidth,
              y: 0,
              type,
            });
          }

          return true;
        }
        return true;
      });

      // Power-up collection
      powerUps.current = powerUps.current.filter((p) => {
        if (isColliding(player.current, p, 40)) {
          if (p.type === "bonus") {
            setScore((s) => s + 5);
            powerupSound.play();
          }
          if (p.type === "shield") {
            activateShield();
            powerupSound.play();
          }
          if (p.type === "slow") {
            activateSlow();
            powerupSound.play();
          }
          return false;
        }
        return p.y < window.innerHeight;
      });

      // Enemy hits
      enemies.current = enemies.current.filter((e) => {
        if (isColliding(player.current, e, 40)) {
          setScore((s) => Math.max(0, s - 5));
          hitSound.play();
          return false;
        }
        return e.y < window.innerHeight;
      });

      // Collision with obstacles
      if (
        !shieldActive &&
        obstacles.current.some((o) => isColliding(player.current, o, 40))
      ) {
        setGameOver(true);
        gameOverSound.play();
        return;
      }

      // Add more obstacles/enemies every 10 points
      if (
        score > 0 &&
        score % 10 === 0 &&
        obstacles.current.length < 2 + Math.floor(score / 10)
      ) {
        obstacles.current.push({
          x: Math.random() * window.innerWidth,
          y: 0,
        });
        enemies.current.push({
          x: Math.random() * window.innerWidth,
          y: 0,
        });
      }

      // Background color toggle
      if (score > 0 && score % 10 === 0) {
        setBgColor(score % 20 === 0 ? "#ffe6cc" : "#ccffcc");
      }

      draw();
      animationId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [gameOver, shieldActive, slowMotion]);

  const isColliding = (p, o, size) => {
    return (
      p.x < o.x + size &&
      p.x + 30 > o.x &&
      p.y < o.y + size &&
      p.y + 30 > o.y
    );
  };

  const activateShield = () => {
    setShieldActive(true);
    setTimeout(() => setShieldActive(false), 3000);
  };

  const activateSlow = () => {
    setSlowMotion(true);
    setTimeout(() => setSlowMotion(false), 5000);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>🧠 Emoji Game with Sound Effects</h1>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight - 100}
        style={{
          border: "5px solid black",
          borderRadius: "15px",
          backgroundColor: bgColor,
        }}
      />
      <h2>{gameOver ? "❌ Game Over" : `Score: ${score}`}</h2>
      {gameOver && (
        <button
          onClick={() => window.location.reload()}
          style={{ padding: "10px 20px", fontSize: "16px", marginTop: "10px" }}
        >
          🔁 Restart
        </button>
      )}
      <p>
        🎮 Arrow keys to move. Collect 🎁, 🛡️, 🐢 — Avoid 💣 and 👹. Score = {score}
      </p>
    </div>
  );
};

export default Game;
