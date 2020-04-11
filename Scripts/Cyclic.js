// var Cyclic_Tasks = [
//     { "at": 0, "ct": 1, "dt": 2 },
//     { "at": 0, "ct": 2, "dt": 5 },
//     { "at": 2, "ct": 2, "dt": 4 },
//     { "at": 3, "ct": 2, "dt": 10 },
//     { "at": 6, "ct": 2, "dt": 9 },
// ];

var Cyclic_Tasks = [
    { "at": 4, "ct": 3, "dt": 14 },
    { "at": 1, "ct": 1, "dt": 2 },
    { "at": 2, "ct": 1, "dt": 4 },
    { "at": 3, "ct": 2, "dt": 7 },
    { "at": 1, "ct": 1, "dt": 3 },
    { "at": 2, "ct": 1, "dt": 5 },
    { "at": 3, "ct": 3, "dt": 10 },
    { "at": 4, "ct": 2, "dt": 16 },
];

// var Cyclic_Tasks = [];

var Cyclic_AddTask_Form = document.getElementById('Cyclic_AddTask');
var Cyclic_Tasks_Tbody = document.getElementById('Cyclic_Tasks');
var Cyclic_ClearTasks_Button = document.getElementById('Cyclic_ClearTasks');

var Cyclic_Schedule_Button = document.getElementById('Cyclic_calcSchedule');
var Cyclic_Schedule_Tbody = document.getElementById('Cyclic_Schedule');
var Cyclic_Schedule_Lateness_Tbody = document.getElementById('Cyclic_Schedule_Lateness');


window.addEventListener('load', (e) => {
    // Clear form fields
    Cyclic_AddTask_Form.reset();
    // Clear schedule + lateness
    Cyclic_ClearTables(true, true, true);

    Cyclic_UpdateTasksTable();
});

Cyclic_AddTask_Form.addEventListener('submit', (e) => {
    // Prevent normal submission of form
    e.preventDefault();
    // Get the form data
    const formData = new FormData(e.target);
    // Get Last Task#
    // var lastTask = Cyclic_Tasks.length > 0 ? Cyclic_Tasks[Cyclic_Tasks.length - 1].t : 0;
    // Add the task to array
    Cyclic_Tasks.push({"ct": parseInt(formData.get('Cyclic_computationTime')), "period": parseInt(formData.get('Cyclic_period')) })
    // Clear form fields
    Cyclic_AddTask_Form.reset();
    // Refresh the table
    Cyclic_UpdateTasksTable();
});

Cyclic_Schedule_Button.addEventListener("click", (e) => {
    // Update Schedule
    Cyclic_UpdateSchedule();
});


function Cyclic_RemoveTask(idx) {
    // Remove specific row
    Cyclic_Tasks.splice(idx, 1);
    // Refresh the table
    Cyclic_UpdateTasksTable();
}

Cyclic_ClearTasks_Button.addEventListener("click", (e) => {
    // Clear Tasks
    Cyclic_Tasks = [];
    // Refresh the table
    Cyclic_UpdateTasksTable();
});

function Cyclic_UpdateTasksTable() {
    // Clear tasks
    Cyclic_ClearTables(true, true, true);
    // Add a new row for each task in the "Cyclic_Tasks" array
    Cyclic_Tasks.forEach((t, idx) => {
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
            Cyclic_RemoveTask(idx);
        };
        e.appendChild(e_button);

        r.appendChild(e);
        Cyclic_Tasks_Tbody.appendChild(r);
    });
}

function Cyclic_UpdateSchedule() {
    // Clear schedule + lateness
    Cyclic_ClearTables(false, true, true);
    var Cyclic_New_Schedule = []

    if (!Cyclic_Tasks.length > 0) {
        return;
    }

    var Cyclic_Tasks_Sorted = Array.from(Cyclic_Tasks);

    Cyclic_Tasks_Sorted.forEach((t, idx) => {
        // Add Task# to each task before sorting
        t["t"] = idx + 1;
        // Add Computation time left
        t["ct_left"] = t["ct"];
    });

    var timeIncrement = Cyclic_Tasks_Sorted.reduce(function (prev, curr) {
        return prev.ct < curr.ct ? prev : curr;
    }).ct;

    // var maxTime = Cyclic_Tasks_Sorted.reduce(function (prev, curr) {
    //     return prev.dt > curr.dt ? prev : curr;
    // }).dt;

    // Cyclic_Tasks_Sorted.sort(function (a, b) {
    //     return a.dt - b.dt;
    // });

    var allTasksFinished = false;
    var css_primary = 0;
    for (let i = 0; !allTasksFinished; i += timeIncrement) {
        // Figure out which task are currently not done/have entered
        // tasks that are available at this point in time
        var validTasks = Cyclic_Tasks_Sorted.filter((t) => t.at <= i);

        var completeTasks = Cyclic_Tasks_Sorted.filter((t) => t.ct_left == 0);
        // tasks that are not yet finished
        var incompleteTasks = validTasks.filter((t) => t.ct_left != 0);
        if (incompleteTasks.length == 0) {
            if (completeTasks.length != Cyclic_Tasks_Sorted.length) {
                continue;
            } else {
                allTasksFinished = true;
                break;
            }
        }
        // sort by deadline
        incompleteTasks.sort((a, b) => a.dt - b.dt);

        // change color
        if (Cyclic_New_Schedule.length > 0 && Cyclic_New_Schedule[Cyclic_New_Schedule.length - 1].Task != incompleteTasks[0].t) {
            css_primary = css_primary ? 0 : 1;
        }

        Cyclic_New_Schedule.push({ "Time": i, "Task": incompleteTasks[0].t, "css": css_primary ? "table-primary" : "table-secondary" })
        // decrement task computation time
        var currTaskIndex = Cyclic_Tasks_Sorted.findIndex((t) => t.t == incompleteTasks[0].t);
        Cyclic_Tasks_Sorted[currTaskIndex].ct_left--;
        // if task is done calc lateness
        if (Cyclic_Tasks_Sorted[currTaskIndex].ct_left == 0) {
            Cyclic_Tasks_Sorted[currTaskIndex]["lateness"] = (i + 1) - Cyclic_Tasks_Sorted[currTaskIndex].dt;
        }

        // var completeTasks = Cyclic_Tasks_Sorted.filter((t) => t.ct_left == 0);
        // completeTasks.forEach((ct) => {
        //     var c = Cyclic_Tasks_Sorted.findIndex((t) => t.t == ct.t);
        //     Cyclic_Tasks_Sorted[c]["lateness"] = i - Cyclic_Tasks_Sorted[c].dt;
        // });
    }

    Cyclic_New_Schedule.forEach((s) => {
        var r = document.createElement("tr");
        r.classList.add(`${s.css}`);

        var a = document.createElement("th");
        a.appendChild(document.createTextNode(`${s.Time}`));
        r.appendChild(a);

        var b = document.createElement("th");
        b.appendChild(document.createTextNode(`T${s.Task}`));
        r.appendChild(b);

        Cyclic_Schedule_Tbody.appendChild(r);
    });

    Cyclic_Tasks_Sorted.forEach((s) => {
        var r = document.createElement("tr");

        var a = document.createElement("th");
        a.appendChild(document.createTextNode(`T${s.t}`));
        r.appendChild(a);

        var b = document.createElement("th");
        b.appendChild(document.createTextNode(`${s.lateness}`));
        r.appendChild(b);

        Cyclic_Schedule_Lateness_Tbody.appendChild(r);
    })

    // Feasibility
    var r = document.createElement("tr");

    var a = document.createElement("th");
    a.appendChild(document.createTextNode(`Feasibility`));
    r.appendChild(a);

    var Feasible = Cyclic_Tasks_Sorted.every((t) => t.lateness <= 0)

    var b = document.createElement("th");
    if (Feasible) {
        b.appendChild(document.createTextNode(`This schedule IS feasible.`));
        r.classList.add("table-success");
    } else {
        b.appendChild(document.createTextNode(`This schedule IS NOT feasible.`));
        r.classList.add("table-danger");
    }
    r.appendChild(b);


    Cyclic_Schedule_Lateness_Tbody.appendChild(r);
}

function Cyclic_ClearTables(tasks, schedule, lateness) {
    if (tasks) {
        Cyclic_Tasks_Tbody.innerHTML = "";
    }
    if (schedule) {
        Cyclic_Schedule_Tbody.innerHTML = "";
    }
    if (lateness) {
        Cyclic_Schedule_Lateness_Tbody.innerHTML = "";
    }
}