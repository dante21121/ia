const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
let isPlaying = false;
let currentFrame = 0;
let activeScene = null;

// ==========================================
// CAPA 1: PARSER LEXICOGRÁFICO Y HEURÍSTICO
// ==========================================
class LexicographicParser {
    parse(prompt) {
        const text = prompt.toLowerCase();
        // Estructura de pensamiento dinámico
        const syntaxTree = {
            context: "day", // Por defecto
            subjects: [],
            actions: [],
            modifiers: { colors: [] }
        };

        // 1. Análisis de Contexto
        if (text.includes("noche") || text.includes("oscuro")) syntaxTree.context = "night";
        if (text.includes("día") || text.includes("dia") || text.includes("sol")) syntaxTree.context = "day";

        // 2. Extracción de Entidades (Sujetos)
        if (text.includes("auto") || text.includes("coche")) syntaxTree.subjects.push("car");
        if (text.includes("casa") || text.includes("edificio")) syntaxTree.subjects.push("house");
        if (text.includes("persona") || text.includes("humano")) syntaxTree.subjects.push("person");
        if (text.includes("cuadrado") || text.includes("cubo")) syntaxTree.subjects.push("square");
        if (text.includes("circulo") || text.includes("esfera")) syntaxTree.subjects.push("circle");

        // Heurística de respaldo: Si no hay sujeto reconocible, usa una forma abstracta
        if (syntaxTree.subjects.length === 0) syntaxTree.subjects.push("abstract");

        // 3. Extracción de Acciones
        if (text.includes("cruzar") || text.includes("mover") || text.includes("avanzar")) syntaxTree.actions.push("cross");
        if (text.includes("saltar") || text.includes("brincar") || text.includes("volar")) syntaxTree.actions.push("jump");

        // 4. Mapeo de Propiedades Estéticas (Colores)
        const colorMap = {
            "rojo": "#ef4444", "azul": "#3b82f6", "verde": "#22c55e", 
            "amarillo": "#eab308", "blanco": "#ffffff", "negro": "#000000"
        };
        for (const [key, hex] of Object.entries(colorMap)) {
            if (text.includes(key)) syntaxTree.modifiers.colors.push(hex);
        }

        return syntaxTree;
    }
}

// ==========================================
// CAPA 2: MOTOR DE COMPOSICIÓN GEOMÉTRICA
// ==========================================
class GeometricComposer {
    build(syntaxTree) {
        const scene = { environment: {}, actors: [] };

        // Configuración dinámica del entorno
        if (syntaxTree.context === "night") {
            scene.environment.background = "#0f172a";
            scene.environment.isNight = true;
        } else {
            scene.environment.background = "#87ceeb"; // Cielo de día
            scene.environment.isNight = false;
        }

        // Construcción de Entidades (Descomposición a Primitivas)
        syntaxTree.subjects.forEach((subject, index) => {
            let actor = { id: `${subject}_${index}`, components: [], actions: syntaxTree.actions };
            // Asigna un color detectado, o un gris neutro si no se especificó ninguno
            let mainColor = syntaxTree.modifiers.colors[index] || syntaxTree.modifiers.colors[0] || "#cbd5e1";

            switch(subject) {
                case "car":
                    actor.components = [
                        { shape: "rect", color: mainColor, x: 0, y: 0, w: 120, h: 40 }, // Chasis
                        { shape: "rect", color: "#94a3b8", x: 20, y: -25, w: 60, h: 25 }, // Cabina
                        { shape: "circle", color: "#1e293b", x: 20, y: 40, r: 16 }, // Rueda trasera
                        { shape: "circle", color: "#1e293b", x: 100, y: 40, r: 16 }  // Rueda delantera
                    ];
                    break;
                case "house":
                    actor.components = [
                        { shape: "rect", color: mainColor, x: 0, y: 0, w: 100, h: 100 }, // Paredes
                        { shape: "triangle", color: "#7f1d1d", x: -10, y: 0, w: 120, h: -60 }, // Techo
                        { shape: "rect", color: "#000", x: 40, y: 50, w: 20, h: 50 } // Puerta
                    ];
                    break;
                case "person":
                    actor.components = [
                        { shape: "circle", color: mainColor, x: 20, y: -50, r: 15 }, // Cabeza
                        { shape: "rect", color: mainColor, x: 15, y: -35, w: 10, h: 55 } // Cuerpo
                    ];
                    break;
                case "square":
                    actor.components = [{ shape: "rect", color: mainColor, x: 0, y: 0, w: 60, h: 60 }];
                    break;
                default: // abstract / circle
                    actor.components = [{ shape: "circle", color: mainColor, x: 0, y: 0, r: 40 }];
            }
            scene.actors.push(actor);
        });

        return scene;
    }
}

// ==========================================
// CAPA 3: PLANIFICADOR CINEMÁTICO
// ==========================================
class KinematicPlanner {
    plan(sceneData) {
        sceneData.actors.forEach((actor, index) => {
            actor.trajectory = {
                startX: actor.actions.includes("cross") ? -150 : (canvas.width / 2) - 50 + (index * 150),
                endX: actor.actions.includes("cross") ? canvas.width + 150 : (canvas.width / 2) - 50 + (index * 150),
                baseY: canvas.height - 120,
                durationSec: 4,
                isJumping: actor.actions.includes("jump")
            };
        });
        return sceneData;
    }
}

// ==========================================
// RENDERIZADO Y BUCLE GRÁFICO (WEBGL / CANVAS 2D)
// ==========================================
function drawShape(comp, baseX, baseY) {
    ctx.fillStyle = comp.color;
    ctx.beginPath();
    
    if (comp.shape === "rect") {
        ctx.fillRect(baseX + comp.x, baseY + comp.y, comp.w, comp.h);
    } else if (comp.shape === "circle") {
        ctx.arc(baseX + comp.x, baseY + comp.y, comp.r, 0, Math.PI * 2);
        ctx.fill();
    } else if (comp.shape === "triangle") {
        ctx.moveTo(baseX + comp.x, baseY + comp.y); // Esquina inf izq
        ctx.lineTo(baseX + comp.x + (comp.w / 2), baseY + comp.y + comp.h); // Pico superior
        ctx.lineTo(baseX + comp.x + comp.w, baseY + comp.y); // Esquina inf der
        ctx.closePath();
        ctx.fill();
    }
}

function animationLoop() {
    if (!isPlaying || !activeScene) return;

    // Limpiar frame
    ctx.fillStyle = activeScene.environment.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar estrellas o sol dinámicamente según el entorno
    if (activeScene.environment.isNight) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(100, 100, 3, 3);
        ctx.fillRect(300, 50, 2, 2);
        ctx.fillRect(600, 150, 4, 4);
        ctx.fillRect(900, 80, 2, 2);
    } else {
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(150, 100, 40, 0, Math.PI * 2);
        ctx.fill();
    }

    // Procesar cada actor en la escena
    activeScene.actors.forEach(actor => {
        const totalFrames = actor.trajectory.durationSec * 60;
        const progress = (currentFrame % totalFrames) / totalFrames;
        
        // Cinemática adaptativa: Eje X (Movimiento lineal)
        let currentX = actor.trajectory.startX + (actor.trajectory.endX - actor.trajectory.startX) * progress;
        
        // Cinemática adaptativa: Eje Y (Salto basado en seno)
        let currentY = actor.trajectory.baseY;
        if (actor.trajectory.isJumping) {
            // El salto alcanza su pico en la mitad del progreso
            const jumpHeight = 150;
            currentY -= Math.sin(progress * Math.PI) * jumpHeight;
        }

        // Renderizar componentes geométricos
        actor.components.forEach(comp => drawShape(comp, currentX, currentY));
    });

    currentFrame++;
    requestAnimationFrame(animationLoop);
}

// ==========================================
// CONTROLADOR DE EVENTOS DE USUARIO
// ==========================================
document.getElementById('btnGenerate').addEventListener('click', () => {
    const promptText = document.getElementById('promptInput').value;
    if (!promptText) return;

    // Inicializar el pensamiento dinámico de la IA
    const parser = new LexicographicParser();
    const composer = new GeometricComposer();
    const planner = new KinematicPlanner();

    const syntaxTree = parser.parse(promptText);
    const sceneData = composer.build(syntaxTree);
    activeScene = planner.plan(sceneData);

    // Guardar en historial
    const historyPanel = document.getElementById('promptHistory');
    historyPanel.innerHTML += `<p style="font-size: 0.9em; margin-top: 8px;">> ${promptText}</p>`;

    // Reiniciar y ejecutar
    currentFrame = 0;
    isPlaying = true;
    animationLoop();
});

document.getElementById('btnPlay').addEventListener('click', () => {
    if (!isPlaying && activeScene) {
        isPlaying = true;
        animationLoop();
    }
});

document.getElementById('btnPause').addEventListener('click', () => isPlaying = false);
