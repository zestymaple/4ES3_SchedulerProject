// var EDD_Tasks = [
//     {"ct": 1, "dt": 3},
//     {"ct": 1, "dt": 10},
//     {"ct": 1, "dt": 7},
//     {"ct": 3, "dt": 8},
//     {"ct": 2, "dt": 5}
// ];

// var EDD_Tasks = [
//     { "ct": 2, "dt": 4 },
//     { "ct": 3, "dt": 3 },
//     { "ct": 2, "dt": 5 },
//     { "ct": 1, "dt": 17 },
//     { "ct": 4, "dt": 15 },
//     { "ct": 1, "dt": 7 },
//     { "ct": 3, "dt": 21 },
//     { "ct": 1, "dt": 26 },
//     { "ct": 2, "dt": 9 },
//     { "ct": 3, "dt": 25 }
// ];

var EDD_Tasks = [];

var EDD_AddTask_Form = document.getElementById('EDD_AddTask');
var EDD_Tasks_Tbody = document.getElementById('EDD_Tasks');
var EDD_ClearTasks_Button = document.getElementById('EDD_ClearTasks');

var EDD_Schedule_Button = document.getElementById('EDD_calcSchedule');
var EDD_Schedule_Tbody = document.getElementById('EDD_Schedule');
var EDD_Schedule_Lateness_Tbody = document.getElementById('EDD_Schedule_Lateness');


window.addEventListener('load', (e) => {
    // Clear form fields
    EDD_AddTask_Form.reset();
    // Clear schedule + lateness
    EDD_ClearTables(true, true, true);

    // EDD_UpdateTasksTable();
});

EDD_AddTask_Form.addEventListener('submit', (e) => {
    // Prevent normal submission of form
    e.preventDefault();
    // Get the form data
    const formData = new FormData(e.target);
    // Get Last Task#
    // var lastTask = EDD_Tasks.length > 0 ? EDD_Tasks[EDD_Tasks.length - 1].t : 0;
    // Add the task to array
    EDD_Tasks.push({ "ct": parseInt(formData.get('EDD_computationTime')), "dt": parseInt(formData.get('EDD_deadline')) })
    // Clear form fields
    EDD_AddTask_Form.reset();
    // Refresh the table
    EDD_UpdateTasksTable();
});

EDD_Schedule_Button.addEventListener("click", (e) => {
    // Update Schedule
    EDD_UpdateSchedule();
});


function EDD_RemoveTask(idx) {
    // Remove specific row
    EDD_Tasks.splice(idx, 1);
    // Refresh the table
    EDD_UpdateTasksTable();
}

EDD_ClearTasks_Button.addEventListener("click", (e) => {
    // Clear Tasks
    EDD_Tasks = [];
    // Refresh the table
    EDD_UpdateTasksTable();
});

function EDD_UpdateTasksTable() {
    // Clear tasks
    EDD_ClearTables(true, true, true);
    // Add a new row for each task in the "EDD_Tasks" array
    EDD_Tasks.forEach((t, idx) => {
        var r = document.createElement("tr");

        var a = document.createElement("th");
        a.appendChild(document.createTextNode(`T${idx + 1}`));
        r.appendChild(a);

        var b = document.createElement("th");
        b.appendChild(document.createTextNode(t["ct"]));
        r.appendChild(b);

        var c = document.createElement("th");
        c.appendChild(document.createTextNode(t["dt"]));
        r.appendChild(c);

        var d = document.createElement("th");
        var d_button = document.createElement("button");
        d_button.appendChild(document.createTextNode("Delete"));
        d_button.classList.add("btn", "btn-danger");
        d_button.onclick = function () {
            EDD_RemoveTask(idx);
        };
        d.appendChild(d_button);

        r.appendChild(d);
        EDD_Tasks_Tbody.appendChild(r);
    });
}

function EDD_UpdateSchedule() {
    // Clear schedule + lateness
    EDD_ClearTables(false, true, true);
    var EDD_New_Schedule = []

    if (!EDD_Tasks.length > 0) {
        return;
    }

    var EDD_Tasks_Sorted = Array.from(EDD_Tasks);

    // Add Task# to each task before sorting
    EDD_Tasks_Sorted.forEach((t, idx) => {
        t["t"] = idx + 1;
    });


    var timeIncrement = EDD_Tasks_Sorted.reduce(function (prev, curr) {
        return prev.ct < curr.ct ? prev : curr;
    }).ct;

    EDD_Tasks_Sorted.sort(function (a, b) {
        return a.dt - b.dt;
    });

    // Start at 0 Sec
    var currentTime = 0;
    var css_primary = 0;
    EDD_Tasks_Sorted.forEach((task) => {
        var taskDuration = currentTime + task.ct;
        // EDD_Tasks_Sorted[idx]["lateness"] = taskDuration - task.dt;
        task["lateness"] = taskDuration - task.dt;

        for (let i = currentTime; i < taskDuration; i += timeIncrement) {
            EDD_New_Schedule.push({ "Time": i, "Task": `T${task.t}`, "css": css_primary ? "table-primary" : "table-secondary" })
        }
        // update currentTime
        currentTime = taskDuration;
        // change color for next task
        css_primary = css_primary ? 0 : 1;
    });

    EDD_New_Schedule.forEach((s) => {
        var r = document.createElement("tr");
        r.classList.add(`${s.css}`);

        var a = document.createElement("th");
        a.appendChild(document.createTextNode(`${s.Time}`));
        r.appendChild(a);

        var b = document.createElement("th");
        b.appendChild(document.createTextNode(`${s.Task}`));
        r.appendChild(b);

        EDD_Schedule_Tbody.appendChild(r);
    });

    EDD_Tasks_Sorted.forEach((s) => {
        var r = document.createElement("tr");

        var a = document.createElement("th");
        a.appendChild(document.createTextNode(`${s.t}`));
        r.appendChild(a);

        var b = document.createElement("th");
        b.appendChild(document.createTextNode(`${s.lateness}`));
        r.appendChild(b);

        EDD_Schedule_Lateness_Tbody.appendChild(r);
    })

    // Feasibility
    var r = document.createElement("tr");

    var a = document.createElement("th");
    a.appendChild(document.createTextNode(`Feasibility`));
    r.appendChild(a);

    var Feasible = EDD_Tasks_Sorted.every((t) => t.lateness <= 0)

    var b = document.createElement("th");
    if (Feasible) {
        b.appendChild(document.createTextNode(`This schedule IS feasible.`));
        r.classList.add("table-success");
    } else {
        b.appendChild(document.createTextNode(`This schedule IS NOT feasible.`));
        r.classList.add("table-danger");
    }
    r.appendChild(b);


    EDD_Schedule_Lateness_Tbody.appendChild(r);
}

function EDD_ClearTables(tasks, schedule, lateness) {
    if (tasks) {
        EDD_Tasks_Tbody.innerHTML = "";
    }
    if (schedule) {
        EDD_Schedule_Tbody.innerHTML = "";
    }
    if (lateness) {
        EDD_Schedule_Lateness_Tbody.innerHTML = "";
    }
}