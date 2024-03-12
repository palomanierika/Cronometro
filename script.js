window.onload = function() {
    // Asociar eventos a los botones
    document.getElementById("startBtn").addEventListener("click", iniciarOReiniciarTemporizador);
    document.getElementById("pauseBtn").addEventListener("click", pausarTemporizador);
    document.getElementById("stopBtn").addEventListener("click", detenerTemporizadorYMostrarTiempo);
    document.getElementById("registrarBtn").addEventListener("click", detenerTemporizador);
    document.getElementById("exportBtn").addEventListener("click", generarExcel);
    document.getElementById("resetBtn").addEventListener("click", reiniciarTemporizador);
}

let startTime;
let timerInterval;
let tiempos = [];
let isPaused = false;
let isStopped = false;
let pauseStartTime = null;
let pauseDuration = 0;
let batchNumber = 1; // Variable para llevar el seguimiento del número de batch

function iniciarOReiniciarTemporizador() {
    if (!isStopped) {
        startTime = new Date();
        timerInterval = setInterval(actualizarTiempo, 1000);
        document.getElementById("startBtn").innerText = "Reiniciar Cronómetro";

        // Ocultar el botón "Registrar Cronómetro"
        document.getElementById("registrarBtn").classList.add("hidden");

        // Mostrar los botones relacionados con el cronómetro
        document.getElementById("pauseBtn").classList.remove("hidden");
        document.getElementById("stopBtn").classList.remove("hidden");

        // Agregar el event listener para el botón "Registrar Cronómetro"
        document.getElementById("registrarBtn").addEventListener("click", detenerTemporizador);
    } else {
        reiniciarTemporizador();
        iniciarOReiniciarTemporizador();
    }
}

function actualizarTiempo() {
    if (!isPaused) {
        const tiempoTranscurrido = new Date() - startTime - pauseDuration;
        document.getElementById("tiempoTranscurrido").innerText = formatoTiempo(tiempoTranscurrido);
    }
}

function pausarTemporizador() {
    if (!isPaused) {
        pauseStartTime = new Date();
        clearInterval(timerInterval);
        isPaused = true;
        document.getElementById("pauseBtn").innerText = "Reanudar Cronómetro";
    } else {
        const pauseEndTime = new Date();
        pauseDuration += pauseEndTime - pauseStartTime;
        timerInterval = setInterval(actualizarTiempo, 1000);
        isPaused = false;
        document.getElementById("pauseBtn").innerText = "Pausar Cronómetro";
    }
}

function detenerTemporizadorYMostrarTiempo() {
    if (!isStopped) {
        clearInterval(timerInterval);
        const tiempoTranscurrido = new Date() - startTime - pauseDuration;
        tiempoDetenido = tiempoTranscurrido; // Almacenar el tiempo transcurrido al detener el temporizador

        // Mostrar el tiempo transcurrido y ocultar el botón de Pausa
        document.getElementById("tiempoTranscurrido").innerText = formatoTiempo(tiempoDetenido);
        document.getElementById("pauseBtn").classList.add("hidden");
        document.getElementById("stopBtn").classList.add("hidden");

        // Mostrar el botón de Registrar Tiempo
        document.getElementById("registrarBtn").classList.remove("hidden");
        isStopped = true; // Marcar el temporizador como detenido
    }
}

function detenerTemporizador() {
    clearInterval(timerInterval);
    tiempos.push(tiempoDetenido); // Registrar el tiempo detenido
    actualizarTabla(); // Actualizar la tabla con el nuevo tiempo registrado

    // Reiniciar el temporizador
    isPaused = false;
    isStopped = false;
    pauseStartTime = null;
    pauseDuration = 0;
    startTime = null;
    document.getElementById("tiempoTranscurrido").innerText = "00:00:00";
    document.getElementById("pauseBtn").innerText = "Pausar Cronómetro";
    document.getElementById("pauseBtn").classList.remove("hidden");
    document.getElementById("stopBtn").classList.remove("hidden");
    document.getElementById("registrarBtn").classList.add("hidden");
}


function formatoTiempo(tiempo) {
    const horas = Math.floor(tiempo / 3600000);
    const minutos = Math.floor((tiempo % 3600000) / 60000);
    const segundos = Math.floor((tiempo % 60000) / 1000);
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

function actualizarTabla() {
    const tiemposBody = document.getElementById("tiemposBody");
    tiemposBody.innerHTML = "";
    let totalTiempo = 0; // Definir la variable totalTiempo

    for (let i = 0; i < tiempos.length; i++) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>Batch ${i + 1}</td>
            <td>${formatoTiempo(tiempos[i])}</td>
        `;
        tiemposBody.appendChild(fila);

        // Agregar el tiempo de cada batch al totalTiempo
        totalTiempo += tiempos[i];
    }

    // Agregar una fila para mostrar el tiempo total
    const filaTotal = document.createElement("tr");
    filaTotal.innerHTML = `
        <td><strong>Tiempo Total</strong></td>
        <td><strong>${formatoTiempo(totalTiempo)}</strong></td>
    `;
    tiemposBody.appendChild(filaTotal);
}

document.getElementById("resetBtn").addEventListener("click", function() {
    if (confirm("Esta acción eliminará todos los registros. ¿Está seguro de continuar?")) {
        reiniciarTemporizador();
        reiniciarTabla();
    }
});

function reiniciarTemporizador() {
    tiempos = []; // Reiniciar la matriz de tiempos
    document.getElementById("tiempoTranscurrido").innerText = "00:00:00"; // Reiniciar el tiempo transcurrido
}

function reiniciarTabla() {
    const tiemposBody = document.getElementById("tiemposBody");
    tiemposBody.innerHTML = "";
}


function generarExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(document.getElementById('tiemposTable'));
    XLSX.utils.book_append_sheet(wb, ws, "Tiempos");
    XLSX.writeFile(wb, 'tiempos.xlsx');
}
