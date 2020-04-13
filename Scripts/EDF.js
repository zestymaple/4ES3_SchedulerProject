var EDF_Tasks = [];

var EDF_AddTask_Form = document.getElementById('EDF_AddTask');
var EDF_Tasks_Tbody = document.getElementById('EDF_Tasks');
var EDF_ClearTasks_Button = document.getElementById('EDF_ClearTasks');

var EDF_Schedule_Button = document.getElementById('EDF_calcSchedule');
var EDF_Schedule_Tbody = document.getElementById('EDF_Schedule');
var EDF_Schedule_Lateness_Tbody = document.getElementById('EDF_Schedule_Lateness');


window.addEventListener('load', (e) => {
    // Clear form fields
    EDF_AddTask_Form.reset();
    // Clear schedule + lateness
    EDF_ClearTables(true, true, true);

    EDF_UpdateTasksTable();
});

EDF_AddTask_Form.addEventListener('submit', (e) => {
    // Prevent normal submission of form
    e.preventDefault();
    // Get the form data
    const formData = new FormData(e.target);
    // Get Last Task#
    // var lastTask = EDF_Tasks.length > 0 ? EDF_Tasks[EDF_Tasks.length - 1].t : 0;
    // Add the task to array
    EDF_Tasks.push({ "at": parseFloat(formData.get('EDF_arrivalTime')), "ct": parseFloat(formData.get('EDF_computationTime')), "dt": parseFloat(formData.get('EDF_deadline')) })
    // Clear form fields
    EDF_AddTask_Form.reset();
    // Refresh the table
    EDF_UpdateTasksTable();
});

EDF_Schedule_Button.addEventListener("click", (e) => {
    // Update Schedule
    EDF_UpdateSchedule();
});


function EDF_RemoveTask(idx) {
    // Remove specific row
    EDF_Tasks.splice(idx, 1);
    // Refresh the table
    EDF_UpdateTasksTable();
}

EDF_ClearTasks_Button.addEventListener("click", (e) => {
    // Clear Tasks
    EDF_Tasks = [];
    // Refresh the table
    EDF_UpdateTasksTable();
});

function EDF_UpdateTasksTable() {
    // Clear tasks
    EDF_ClearTables(true, true, true);
    // Add a new row for each task in the "EDF_Tasks" array
    EDF_Tasks.forEach((t, idx) => {
        var r = document.createElement("tr");

        var a = document.createElement("th");
        a.appendChild(document.createTextNode(`T${idx + 1}`));
        r.appendChild(a);

        var b = document.createElement("th");
        b.appendChild(document.createTextNode(t["at"]));
        r.appendChild(b);

        var c = document.createElement("th");
        c.appendChild(document.createTextNode(t["ct"]));
        r.appendChild(c);

        var d = document.createElement("th");
        d.appendChild(document.createTextNode(t["dt"]));
        r.appendChild(d);

        var e = document.createElement("th");
        var e_button = document.createElement("button");
        e_button.appendChild(document.createTextNode("Delete"));
        e_button.classList.add("btn", "btn-danger");
        e_button.onclick = function () {
            EDF_RemoveTask(idx);
        };
        e.appendChild(e_button);

        r.appendChild(e);
        EDF_Tasks_Tbody.appendChild(r);
    });
}

function EDF_UpdateSchedule() {
    // Clear schedule + lateness
    EDF_ClearTables(false, true, true);
    var EDF_New_Schedule = []

    if (!EDF_Tasks.length > 0) {
        return;
    }

    var EDF_Tasks_Sorted = Array.from(EDF_Tasks);

    EDF_Tasks_Sorted.forEach((t, idx) => {
        // Add Task# to each task before sorting
        t["t"] = idx + 1;
        // Add Computation time left
        t["ct_left"] = t["ct"];
    });

    var timeIncrement = EDF_Tasks_Sorted.reduce(function (prev, curr) {
        return prev.ct < curr.ct ? prev : curr;
    }).ct;

    // var maxTime = EDF_Tasks_Sorted.reduce(function (prev, curr) {
    //     return prev.dt > curr.dt ? prev : curr;
    // }).dt;

    // EDF_Tasks_Sorted.sort(function (a, b) {
    //     return a.dt - b.dt;
    // });

    var allTasksFinished = false;
    var css_primary = 0;
    for (let i = 0; !allTasksFinished; i += timeIncrement) {
        // Figure out which task are currently not done/have entered
        // tasks that are available at this point in time
        var validTasks = EDF_Tasks_Sorted.filter((t) => t.at <= i);

        var completeTasks = EDF_Tasks_Sorted.filter((t) => t.ct_left == 0);
        // tasks that are not yet finished
        var incompleteTasks = validTasks.filter((t) => t.ct_left != 0);
        if (incompleteTasks.length == 0) {
            if (completeTasks.length != EDF_Tasks_Sorted.length) {
                continue;
            } else {
                allTasksFinished = true;
                break;
            }
        }
        // sort by deadline
        incompleteTasks.sort((a, b) => a.dt - b.dt);

        // change color
        if (EDF_New_Schedule.length > 0 && EDF_New_Schedule[EDF_New_Schedule.length - 1].Task != incompleteTasks[0].t) {
            css_primary = css_primary ? 0 : 1;
        }

        EDF_New_Schedule.push({ "Time": i, "Task": incompleteTasks[0].t, "css": css_primary ? "table-primary" : "table-secondary" })
        // decrement task computation time
        var currTaskIndex = EDF_Tasks_Sorted.findIndex((t) => t.t == incompleteTasks[0].t);
        EDF_Tasks_Sorted[currTaskIndex].ct_left--;
        // if task is done calc lateness
        if (EDF_Tasks_Sorted[currTaskIndex].ct_left == 0) {
            EDF_Tasks_Sorted[currTaskIndex]["lateness"] = (i + 1) - EDF_Tasks_Sorted[currTaskIndex].dt;
        }

        // var completeTasks = EDF_Tasks_Sorted.filter((t) => t.ct_left == 0);
        // completeTasks.forEach((ct) => {
        //     var c = EDF_Tasks_Sorted.findIndex((t) => t.t == ct.t);
        //     EDF_Tasks_Sorted[c]["lateness"] = i - EDF_Tasks_Sorted[c].dt;
        // });
    }

    EDF_New_Schedule.forEach((s) => {
        var r = document.createElement("tr");
        r.classList.add(`${s.css}`);

        var a = document.createElement("th");
        a.appendChild(document.createTextNode(`${s.Time}`));
        r.appendChild(a);

        var b = document.createElement("th");
        b.appendChild(document.createTextNode(`T${s.Task}`));
        r.appendChild(b);

        EDF_Schedule_Tbody.appendChild(r);
    });

    EDF_Tasks_Sorted.forEach((s) => {
        var r = document.createElement("tr");

        var a = document.createElement("th");
        a.appendChild(document.createTextNode(`T${s.t}`));
        r.appendChild(a);

        var b = document.createElement("th");
        b.appendChild(document.createTextNode(`${s.lateness}`));
        r.appendChild(b);

        EDF_Schedule_Lateness_Tbody.appendChild(r);
    })

    // Feasibility
    var r = document.createElement("tr");

    var a = document.createElement("th");
    a.appendChild(document.createTextNode(`Feasibility`));
    r.appendChild(a);

    var Feasible = EDF_Tasks_Sorted.every((t) => t.lateness <= 0)

    var b = document.createElement("th");
    if (Feasible) {
        b.appendChild(document.createTextNode(`This schedule IS feasible.`));
        r.classList.add("table-success");
    } else {
        b.appendChild(document.createTextNode(`This schedule IS NOT feasible.`));
        r.classList.add("table-danger");
    }
    r.appendChild(b);


    EDF_Schedule_Lateness_Tbody.appendChild(r);
}

function EDF_ClearTables(tasks, schedule, lateness) {
    if (tasks) {
        EDF_Tasks_Tbody.innerHTML = "";
    }
    if (schedule) {
        EDF_Schedule_Tbody.innerHTML = "";
    }
    if (lateness) {
        EDF_Schedule_Lateness_Tbody.innerHTML = "";
    }
}