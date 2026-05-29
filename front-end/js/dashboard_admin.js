function addLog() {
  const log = document.getElementById("logContent");

  const newLog = document.createElement("p");
  const date = new Date().toLocaleString();

  newLog.textContent = "Edição realizada em: " + date;

  log.appendChild(newLog);
}