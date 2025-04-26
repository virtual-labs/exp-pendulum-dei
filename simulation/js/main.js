const getElement = (id) => {
  return document.getElementById(id);
};
const setText = (id, text) => {
  document.getElementById(id).innerText = text;
};

function setComponentValues_comp(angle, length, radius, width, mass) {
  comp_angle_input.value = angle;
  comp_length_input.value = length;
  comp_radius_input.value = radius;
  comp_width_input.value = width;
  comp_mass_input.value = mass;
}

function showInputs_comp() {
  comp_angle_input.hidden = false;
  comp_length_input.hidden = false;
  comp_radius_input.hidden = false;
  comp_width_input.hidden = false;
  pendulumTypeSelect.hidden = false;
  comp_mass_input.hidden = false;
  comp_oscillations_input.hidden = false;
  comp_pivot_input.hidden = false;
}

const canvas = getElement("cnv");
const context = canvas.getContext("2d");

const lengthInput = getElement("length");
const angleInput = getElement("angle");
const lockButton = getElement("lock");
const playButton = getElement("playButton");
const oscillationInput = getElement("oscillations");
const resetButton = getElement("resetButton");
const pauseButton = getElement("pauseButton");
const timeTakenBlock = getElement("timetaken");
const timePeriodBlock = getElement("timeperiod");
const resultInertiaBlock = getElement("resultInertia");

let animationFrameId;
let isAnimating = false;
let startTime = 0;
let elapsedTime = 0;
let previousTime = 0;

const originX = canvas.width / 2;
const originY = 10;
// Pendulum properties
let initialAngle = 0.261799;
let maxOscillations = 5;
let oscillationCounting = 0;

let pendulum = {
  length: 300,
  angle: 0.261799, // 15 degree
  gravity: 9.81,
};

let omega = Math.sqrt(pendulum.gravity / (pendulum.length / 100));
let timePeriod = 10;
let timeperiodSet = [];

lengthInput.addEventListener("input", () => {
  pendulum.length = parseFloat(lengthInput.value);
  drawPendulum();
});
const updateLengthValue = (value) => {
  lengthInput.value = value;
  // getElement("lengthValue").innerText = value;
  setText("lengthValue", value);
};

angleInput.addEventListener("input", () => {
  pendulum.angle = (parseFloat(angleInput.value) * Math.PI) / 180;
  initialAngle = (parseFloat(angleInput.value) * Math.PI) / 180;
  drawPendulum();
});

const updateAngleValue = (value) => {
  angleInput.value = value;
  getElement("angleValue").innerText = value;
  setText("angleValue", value);
};

oscillationInput.addEventListener("input", () => {
  maxOscillations = oscillationInput.value;
});

const checkBox = () => {
  if (lockButton.checked) {
    pendulum.length = parseFloat(lengthInput.value);
    pendulum.angle = (parseFloat(angleInput.value) * Math.PI) / 180;
    omega = Math.sqrt(pendulum.gravity / (pendulum.length / 100));

    timePeriod =
      2 * Math.PI * Math.sqrt(pendulum.length / 100 / pendulum.gravity);
    timeperiodSet = [];
    for (var i = 1; i <= maxOscillations; i++) {
      timeperiodSet.push((timePeriod * i).toFixed(2));
    }

    angleInput.hidden = true;
    lengthInput.hidden = true;
    oscillationInput.hidden = true;
    setText("countOscillationText", `Oscillation Count : ${maxOscillations}`);
    drawPendulum();
    updateMomentOfInertia();

    console.log(timeperiodSet);
    getElement('lock').disabled = true;
  } else {
    angleInput.hidden = false;
    lengthInput.hidden = false;
    oscillationInput.hidden = false;
  }
};

const updateMomentOfInertia = () => {
  const momentOfInertia = Math.pow(pendulum.length / 100, 2);
  setText("momentOfInertiaValue", momentOfInertia.toFixed(2));
};

const giveAlert = () => {
  window.alert("Lock the values first");
};
// Update and draw the pendulum
function drawPendulum() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawProtractor();

  const x = canvas.width / 2 + pendulum.length * Math.sin(pendulum.angle);
  const y = pendulum.length * Math.cos(pendulum.angle);

  // Draw the pendulum
  context.beginPath();
  context.moveTo(canvas.width / 2, 0);
  context.lineTo(x, y);
  context.stroke();

  context.beginPath();
  context.arc(x, y, 10, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#FFBF00";
  context.fill();
  context.strokeStyle = "#000";
  context.stroke();
}

function drawProtractor() {
  context.strokeStyle = "#000000";
  context.lineWidth = 1;

  const startAngle = 0;
  const endAngle = Math.PI; // 180 degrees in radians
  const totalMarks = 180; // 180 marks for 180 degrees
  const bigMarkInterval = 10; // Big mark every 10 degrees
  const mediumMarkInterval = 5; // Medium mark between every 10-degree mark

  const bigMarkLength = 20;
  const mediumMarkLength = 12;
  const smallMarkLength = 4;
  const radius = 100;

  // Draw marks
  for (let i = 0; i <= totalMarks; i++) {
    const angle2 = startAngle + (i * (endAngle - startAngle)) / totalMarks;
    let markLength;
    if (i % bigMarkInterval === 0) {
      markLength = bigMarkLength;
    } else if (i % mediumMarkInterval === 0) {
      markLength = mediumMarkLength;
    } else {
      markLength = smallMarkLength;
    }
    const startX = originX + radius * Math.cos(angle2);
    const startY = originY + radius * Math.sin(angle2);
    const endX = originX + (radius + markLength) * Math.cos(angle2);
    const endY = originY + (radius + markLength) * Math.sin(angle2);
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
  }
}

let i = 0;

function updatePendulum(time) {
  pendulum.angle = initialAngle * Math.cos(omega * time);
  if (time >= timeperiodSet[i]) {
    oscillationCounting++;
    setText("oscillationCount", `Oscillation count : ${oscillationCounting}`);
    i++;
  }
  if (oscillationCounting >= maxOscillations) {
    stopAnimation();
    showFinalResults();
  }
}
const showFinalResults = () => {
  const totalTimeTaken = elapsedTime.toFixed(2);
  const timePeriod = totalTimeTaken / maxOscillations;
  const experimentalInertia =
    Math.pow(timePeriod / (2 * Math.PI), 2) *
    pendulum.gravity *
    (pendulum.length / 100);

  timeTakenBlock.innerText = `${totalTimeTaken} sec`;
  timePeriodBlock.innerText = `${timePeriod.toFixed(2)} sec`;
  resultInertiaBlock.innerText = `${experimentalInertia.toFixed(2)} kg-m²`;
};

function updateTimer() {
  const currentTime = (performance.now() - startTime) / 1000; // Time in seconds
  setText("stopwatch", `Time: ${currentTime.toFixed(2)}s`);
}

function animate(timestamp) {
  if (previousTime === 0) previousTime = timestamp;
  const deltaTime = (timestamp - previousTime) / 1000; // Time in seconds
  previousTime = timestamp;

  const currenttime = (performance.now() - startTime) / 1000;
  if (isAnimating) {
    updatePendulum(currenttime);
    drawPendulum();
    updateTimer();
    animationFrameId = requestAnimationFrame(animate);
  }
}

function startAnimation() {
  if (!lockButton.checked) {
    giveAlert();
    return;
  }
  if (!isAnimating) {
    startTime = performance.now() - elapsedTime * 1000; // Continue from where it was left
    previousTime = 0; // Reset the previous time
    isAnimating = true;
    animationFrameId = requestAnimationFrame(animate);
  }
}

function stopAnimation() {
  // if (!lockButton.checked) {
  //     giveAlert()
  //     return
  // }
  if (isAnimating) {
    isAnimating = false;
    cancelAnimationFrame(animationFrameId);
    const currentTime = (performance.now() - startTime) / 1000; // Time in seconds
    elapsedTime = currentTime; // Save elapsed time
  }
}

const resetAnimation = () => {
  getElement('lock').disabled = false;
  stopAnimation();
  pendulum.angle = 0.261799; // Reset angle to initial position
  pendulum.length = 300;

  angleInput.value = 15;
  lengthInput.value = 300;

  setText("angleValue", angleInput.value);
  setText("lengthValue", lengthInput.value);
  setText("stopwatch", `Time: 0.00 s`);
  setText("momentOfInertiaValue", `-`);
  setText("countOscillationText", `Oscillation Count :`);
  setText("oscillationCount", `Oscillation count : 0`);

  timeTakenBlock.innerText = `0 sec`;
  timePeriodBlock.innerText = `0 sec`;
  resultInertiaBlock.innerText = `0 kg-m²`;

  lockButton.checked = false;
  angleInput.hidden = false;
  lengthInput.hidden = false;
  oscillationInput.hidden = false;

  elapsedTime = 0;
  i = 0;
  oscillationCounting = 0;
  previousTime = 0;
  startTime = 0;

  drawPendulum();
};

playButton.addEventListener("click", startAnimation);
pauseButton.addEventListener("click", stopAnimation);
resetButton.addEventListener("click", resetAnimation);
// Initial drawing
drawPendulum();

const pendulumTypeSelect = getElement("pendulumType");
const comp_angle_input = getElement("angle_comp");
const comp_radius_input = getElement("radius_comp");
const comp_length_input = getElement("length_comp");
const comp_width_input = getElement("width_comp");
const comp_oscillations_input = getElement("oscillations_comp");
const comp_mass_input = getElement("mass_comp");
const comp_pivot_input = getElement("pivot_comp");

const lockButton_comp = getElement("lock_comp");

const playButton_comp = getElement("playButton_comp");
const resetButton_comp = getElement("resetButton_comp");
const pauseButton_comp = getElement("pauseButton_comp");

const compound_canvas = getElement("cnv2");
const ctx = compound_canvas.getContext("2d");
const centerX = compound_canvas.width / 2;
const centerY = 150;
let pivotOffset = 50;

let comp_pendulum = {
  type: "rod",
  length: 300,
  width: 10,
  angle: 0.261799,
  mass: 1,
  radius: 30,
};

let maxOscillations_comp = 5;
let oscillationCounting_comp = 0;

// saving inputs
const updatePendulum_inputs_comp = (input, key, displayId, isAngle = false) => {
  comp_pendulum[key] = isAngle
    ? parseFloat(input.value) * (Math.PI / 180)
    : parseFloat(input.value);
  if (displayId) getElement(displayId).innerText = input.value;
  drawCompoundPendulum();
};

comp_length_input.addEventListener("input", () =>
  updatePendulum_inputs_comp(comp_length_input, "length", "length_comp_val")
);
comp_width_input.addEventListener("input", () =>
  updatePendulum_inputs_comp(comp_width_input, "width", "width_comp_val")
);
comp_radius_input.addEventListener("input", () =>
  updatePendulum_inputs_comp(comp_radius_input, "radius", "radius_comp_val")
);
comp_angle_input.addEventListener("input", () =>
  updatePendulum_inputs_comp(comp_angle_input, "angle", "angle_comp_val", true)
);
comp_oscillations_input.addEventListener("input", () =>
  updatePendulum_inputs_comp(comp_oscillations_input, "maxOscillations_comp")
);
comp_mass_input.addEventListener("input", () =>
  updatePendulum_inputs_comp(comp_mass_input, "mass", "mass_comp_val")
);

comp_pivot_input.addEventListener("input", () => {
  console.log(document.getElementById("pivot_comp").value);
  pivotOffset = parseInt(document.getElementById("pivot_comp").value);
  getElement("pivot_comp_val").innerText = comp_pivot_input.value;
  drawCompoundPendulum();
});

pendulumTypeSelect.addEventListener("change", function () {
  comp_pendulum.type = this.value;
  console.log(comp_pendulum.type);
  if (comp_pendulum.type != "rod") {
    pivotOffset = 50;
  }
  const isDisk = comp_pendulum.type === "disk";
  const isRod = comp_pendulum.type === "rod";
  getElement("radiusInput").hidden = !isDisk;
  getElement("compWidthInput").hidden = isDisk || isRod;
  getElement("compLengthInput").hidden = isDisk || isRod;
  getElement("compPivotInput").hidden = !isRod;
  drawCompoundPendulum();
});

const change = (radio) => {
  const isCompound = radio.checked && radio.id === "compoundPendulum";
  // Toggle visibility
  ["leftPane", "cnv", "rightPane"].forEach(
    (id) => (getElement(id).hidden = isCompound)
  );
  ["leftPane2", "rightPane2", "cnv2", "lock_comp"].forEach(
    (id) => (getElement(id).hidden = !isCompound)
  );
  // Draw pendulum
  isCompound ? drawCompoundPendulum() : drawPendulum();
};

const theoritcal_comp_inertia = () => {
  //destructuring
  const {
    type: pendulumType,
    mass,
    length: rodLength,
    width: rodWidth,
    radius: comp_radius,
  } = comp_pendulum;
  let i_com, h;

  switch (pendulumType) {
    case "rod":
      i_com = (mass * Math.pow(rodLength / 100, 2)) / 12;
      h = (rodLength / 2 - pivotOffset) / 100;
      break;
    case "rectangularPlate":
      const a = rodLength / 100,
        b = rodWidth / 100;
      i_com = (mass * (a * a + b * b)) / 12;
      h = (rodLength / 2 - pivotOffset) / 100;
      break;
    case "disk":
      const r = comp_radius / 100;
      i_com = (mass * r * r) / 2;
      h = comp_radius / 2 / 100;
      break;
  }
  return i_com + mass * (h * h);
};

let timePeriod_comp = 0;
let timeperiodSet_comp = [];
let initialAngle_comp = 0.261799;

const checkBox_comp = () => {
  if (lockButton_comp.checked) {
    const inertia = theoritcal_comp_inertia();
    maxOscillations_comp = parseFloat(comp_oscillations_input.value);
    setText(
      "comp_inertia_theoritcal",
      `Theoretical MOI: ${inertia.toFixed(2)} kg-m²`
    );

    initialAngle_comp = comp_pendulum.angle;
    console.log("Inertia calc", inertia);

    const factor = comp_pendulum.mass * 9.81;
    let x;
    if (comp_pendulum.type == "disk") {
      x = inertia / (factor * (comp_pendulum.radius / 2 / 100));
    } else {
      x = inertia / (factor * ((comp_pendulum.length / 2 - pivotOffset) / 100));
    }

    timePeriod_comp = 2 * Math.PI * Math.sqrt(x);
    console.log("Time period comp", timePeriod_comp);

    timeperiodSet_comp = [];
    for (var i = 1; i <= maxOscillations_comp; i++) {
      timeperiodSet_comp.push((timePeriod_comp * i).toFixed(2));
    }
    console.log(timeperiodSet_comp);

    let inputFields = ["angle", "length", "radius", "width", "mass", "pivot"];
    inputFields.forEach((prop) => {
      const id = `${prop}_comp`;
      getElement(id).hidden = true;
    });
    pendulumTypeSelect.hidden = true;
    comp_oscillations_input.hidden = true;
    setText(
      "osciallations_comp_text",
      `No. of Oscillations: ${maxOscillations_comp}`
    );
    setText(
      "pendulumType_text",
      `Selected Type: ${comp_pendulum.type.toUpperCase()}`
    );
     getElement('lock_comp').disabled = true;
  } else {
    showInputs_comp();
    setText("osciallations_comp_text", `No. of Oscillations:`);
    setText("pendulumType_text", `Select Pendulum`);
  }
};

function drawCompoundPendulum() {
  ctx.clearRect(0, 0, compound_canvas.width, compound_canvas.height);

  if (comp_pendulum.type === "disk") {
    drawDisk();
  } else if (comp_pendulum.type === "rectangularPlate") {
    drawRectangularPlate();
  } else {
    drawRod();
  }
  // Draw the hinge
  ctx.beginPath();
  ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
  ctx.strokeStyle = "black";
  ctx.setLineDash([]);
  ctx.stroke();
  // Dashed line through hinge
  const lineLength = 100;
  const angleh = -20 * (Math.PI / 180); // Angle in radians
  const startX = centerX - lineLength * Math.cos(angleh);
  const startY = centerY - lineLength * Math.sin(angleh);
  const endX = centerX + lineLength * Math.cos(angleh);
  const endY = centerY + lineLength * Math.sin(angleh);
  // Set dashed line style
  ctx.setLineDash([5, 10]);
  // Draw dashed line
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawRectangularPlate() {
  ctx.clearRect(0, 0, compound_canvas.width, compound_canvas.height);
  const theta = -comp_pendulum.angle; // Convert to radians
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(theta);
  // Draw the rectangular plate
  ctx.fillStyle = "#DAA06D";
  ctx.fillRect(
    -comp_pendulum.width / 2,
    -pivotOffset,
    comp_pendulum.width,
    comp_pendulum.length
  );

  ctx.restore();
}

function drawRod() {
  ctx.clearRect(0, 0, compound_canvas.width, compound_canvas.height);
  const theta = -comp_pendulum.angle; // Convert to radians
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(theta);

  // Draw the rod
  ctx.fillStyle = "#DAA06D";
  ctx.fillRect(-10 / 2, -pivotOffset, 10, comp_pendulum.length);

  const holeRadius = 3; // Adjust radius as needed
  const spacing = 25; // Spacing between holes
  const rodLength = comp_pendulum.length;

  ctx.fillStyle = "#000000"; // Color for the holes

  for (let i = spacing; i < rodLength; i += spacing) {
    ctx.beginPath();
    ctx.arc(0, -pivotOffset + i, holeRadius, 0, 2 * Math.PI); // Position holes along the rod
    ctx.fill();
  }

  ctx.restore();
}

function drawDisk() {
  ctx.clearRect(0, 0, compound_canvas.width, compound_canvas.height);
  const theta = -comp_pendulum.angle; // Convert to radians
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(theta);
  // Draw the circular disk
  ctx.beginPath();
  ctx.arc(0, comp_pendulum.radius / 2, comp_pendulum.radius, 0, 2 * Math.PI);
  ctx.fillStyle = "#DAA06D";
  ctx.fill();
  ctx.restore();
}

let startTime_comp = 0;
let elapsedTime_comp = 0;
let animationFrameId_comp;
let isAnimating_comp = false;
let previousTime_comp = 0;
let i_comp = 0;

function updatePendulum_comp(time) {
  comp_pendulum.angle =
    initialAngle_comp * Math.cos(((2 * Math.PI) / timePeriod_comp) * time);
  console.log("Comp pendulum angle", comp_pendulum.angle);
  console.log("Time period comp", timePeriod_comp);

  if (time >= timeperiodSet_comp[i_comp]) {
    oscillationCounting_comp++;
    setText(
      "oscillationCount_comp",
      `Oscillation count : ${oscillationCounting_comp}`
    );
    i_comp++;
  }

  if (oscillationCounting_comp >= maxOscillations_comp) {
    console.log("Stopped because oscillations completed");
    stopAnimation_comp();
    showFinalResults_comp();
  }
}

function animate_comp(timestamp) {
  if (previousTime_comp === 0) previousTime_comp = timestamp;
  const deltaTime = (timestamp - previousTime_comp) / 1000; // Time in seconds
  previousTime_comp = timestamp;

  const currenttime_comp = (performance.now() - startTime_comp) / 1000;
  if (isAnimating_comp) {
    updatePendulum_comp(currenttime_comp);
    drawCompoundPendulum();
    updateTimer_comp();
    animationFrameId_comp = requestAnimationFrame(animate_comp);
  }
}

function updateTimer_comp() {
  const currentTime = (performance.now() - startTime_comp) / 1000; // Time in seconds
  setText("stopwatch_comp", `Time: ${currentTime.toFixed(2)}s`);
}

function showFinalResults_comp() {
  const timePeriod = elapsedTime_comp / maxOscillations_comp;
  const {
    type: pendulumType,
    mass,
    radius: comp_radius,
    length: rodLength,
  } = comp_pendulum;
  const gravity = 9.81;
  const commonFactor =
    (timePeriod * timePeriod * mass * gravity) / (4 * Math.PI * Math.PI);

  let experimentalInertia =
    pendulumType === "disk"
      ? (commonFactor * (comp_radius / 2)) / 100
      : commonFactor * ((rodLength / 2 - pivotOffset) / 100);

  setText("timetaken_comp", `${elapsedTime_comp.toFixed(2)} s`);
  setText("timeperiod_comp", `${timePeriod.toFixed(2)} s`);
  setText("resultInertia_comp", `${experimentalInertia.toFixed(2)} kg·m²`);
}

function stopAnimation_comp() {
  // if (!lockButton_comp.checked) {
  //     giveAlert()
  //     return
  // }
  if (isAnimating_comp) {
    isAnimating_comp = false;
    cancelAnimationFrame(animationFrameId);
    const currentTime = (performance.now() - startTime_comp) / 1000; // Time in seconds
    elapsedTime_comp = currentTime; // Save elapsed time
  }
}

const startAnimation_comp = () => {
  if (!lockButton_comp.checked) {
    giveAlert();
    return;
  }

  console.log(comp_pendulum);
  console.log("Therorital inertia", theoritcal_comp_inertia());

  if (!isAnimating_comp) {
    startTime_comp = performance.now() - elapsedTime_comp * 1000; // Continue from where it was left
    previousTime_comp = 0; // Reset the previous time
    isAnimating_comp = true;
    animationFrameId_comp = requestAnimationFrame(animate_comp);
  }
};

const resetAnimation_comp = () => {
  if (isAnimating_comp) {
    isAnimating_comp = false;
    cancelAnimationFrame(animationFrameId);
    const currentTime = (performance.now() - startTime_comp) / 1000; // Time in seconds
    elapsedTime_comp = currentTime; // Save elapsed time
  }

  comp_pendulum = {
    type: "rod",
    length: 300,
    width: 10,
    angle: 0.261799,
    mass: 1,
    radius: 30,
  };
  pivotOffset = 50;

  showInputs_comp();

  
  getElement('lock_comp').disabled = false;
  getElement("radiusInput").hidden = true;
  getElement("compWidthInput").hidden = true;
  getElement("compLengthInput").hidden = true;
  getElement("compPivotInput").hidden = false;
  pendulumTypeSelect.value = "rod";

  setComponentValues_comp(15, 200, 20, 10, 1);
  // Update input fields
  ["angle", "length", "width", "radius"].forEach((prop) => {
    const id = `${prop}_comp`;
    getElement(id).innerText = comp_pendulum[prop];
  });

  setText("mass_comp_val", `1`);
  setText("comp_inertia_theoritcal", `Theoretical MOI : 0 kg-m²`);
  setText("pivot_comp_val", 50);
  getElement("oscillations_comp").value = 5;
  getElement("pivot_comp").value = 50;

  const elementsToUpdate = {
    angle_comp_val: 15,
    length_comp_val: 200,
    width_comp_val: 10,
    radius_comp_val: 20,
    mass_comp_val: 1,
    stopwatch_comp: `Time: 0.00 s`,
    oscillationCount_comp: `Oscillation Count : 0`,
    osciallations_comp_text: `Number of Oscillations: `,
    pendulumType_text: `Select Pendulum Type: `,
    timetaken_comp: `0 sec`,
    timeperiod_comp: `0 sec`,
    resultInertia_comp: `0 kg-m²`,
  };

  Object.keys(elementsToUpdate).forEach((id) => {
    getElement(id).innerText = elementsToUpdate[id];
  });

  lockButton_comp.checked = false;

  elapsedTime_comp = 0;
  i_comp = 0;
  isAnimating_comp = false;
  previousTime_comp = 0;
  startTime_comp = 0;
  oscillationCounting_comp = 0;
  drawCompoundPendulum();
};

playButton_comp.addEventListener("click", startAnimation_comp);
pauseButton_comp.addEventListener("click", stopAnimation_comp);
resetButton_comp.addEventListener("click", resetAnimation_comp);

drawCompoundPendulum();
