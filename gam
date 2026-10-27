const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
let isPlaying = false;
let currentFrame = 0;
let activeScene = null;

// ==========================================
// ARQUITECTURA DEL AGENTE "IA INTERNA"
// ==========================================

// Capa 1: Parser Lexicográfico
class LexicographicParser {
    parse(prompt) {
        // Analiza el prompt y extrae entidades, acciones y entorno.
        // Aquí se simula la extracción para el comando del "auto rojo".
        return {
            intent: "move_vehicle",
            context: "city_night",
            subject: "car",
            modifiers: { color: "#ef4444" }
        };
    }
}

// Capa 2: Motor de Composición Geométrica
class GeometricComposer {
    build(syntaxTree) {
        // Mapea conceptos a formas geométricas puras.
        // Se utiliza el diccionario de ensamblaje tipológico del JSON.
        if (syntaxTree.subject === "car") {
            return {
                environment: {
                    type: "city_night",
                    background: "#0f172a",
                    elements: ["stars", "buildings"]
                },
                actors: [{
                    id: "car_01",
                    type: "composite",
                    components: [
                        { shape: "rect", color: syntaxTree.modifiers.color, relX: 0, relY: 0, w: 180, h: 60 },
                        { shape: "rect", color: "#94a3b8", relX: 45, relY: -36, w: 90, h: 36 },
                        { shape: "circle", color: "#334155", relX: 30, relY: 60, r: 24 },
                        { shape: "circle", color: "#334155", relX: 150, relY: 60, r: 24 }
                    ]
                }]
            };
        }
        return null;
    }
}

// Capa 3: Planificador Cinemático
class KinematicPlanner {
    plan(sceneData) {
        // Genera trayectorias e interpolaciones.
        sceneData.actors[0].trajectory = {
            startX: -200,
            endX: canvas.width + 200,
            durationSec: 4,
            easing: "easeInOut"
        };
        return sceneData;
    }
}

// ==========================================
// MOTOR GRÁFICO Y RENDERIZADO
// ==========================================

function drawActor(actor, x, y) {
    actor.components.forEach(comp => {
        ctx.fillStyle = comp.color;
        if (comp.shape === "rect") {
            ctx.fillRect(x + comp.relX, y + comp.relY, comp.w, comp.h);
        } else if (comp.shape === "circle") {
            ctx.beginPath();
            ctx.arc(x + comp.relX, y + comp.relY, comp.r, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function animationLoop() {
    if (!isPlaying || !activeScene) return;

    // Limpiar frame (entorno)
    ctx.fillStyle = activeScene.environment.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calcular interpolación lineal temporal (60 FPS)
    const actor = activeScene.actors[0];
    const totalFrames = actor.trajectory.durationSec * 60;
    const progress = (currentFrame % totalFrames) / totalFrames;
    
    // Calcular X actual basado en trayectoria
    const currentX = actor.trajectory.startX + (actor.trajectory.endX - actor.trajectory.startX) * progress;
    const currentY = canvas.height - 150; // Posición base Y

    drawActor(actor, currentX, currentY);

    currentFrame++;
    requestAnimationFrame(animationLoop);
}

// ==========================================
// CONTROLADORES DE INTERFAZ
// ==========================================

document.getElementById('btnGenerate').addEventListener('click', () => {
    const promptText = document.getElementById('promptInput').value;
    if (!promptText) return;

    // Ejecutar pipeline de 3 capas
    const parser = new LexicographicParser();
    const composer = new GeometricComposer();
    const planner = new KinematicPlanner();

    const syntaxTree = parser.parse(promptText);
    const sceneData = composer.build(syntaxTree);
    activeScene = planner.plan(sceneData);

    // Iniciar renderizado
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

document.getElementById('btnPause').addEventListener('click', () => {
    isPlaying = false;
});
