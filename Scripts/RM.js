var RM_Tasks = [];
var minorCycle = 0;
var majorCycle = 0;

var RM_AddTask_Form = document.getElementById('RM_AddTask');
var RM_Tasks_Tbody = document.getElementById('RM_Tasks');
var RM_ClearTasks_Button = document.getElementById('RM_ClearTasks');

var RM_Schedule_Button = document.getElementById('RM_calcSchedule');
var RM_Schedule_Tbody = document.getElementById('RM_Schedule');


window.addEventListener('load', (e) => {
    // Clear form fields
    RM_AddTask_Form.reset();
    // Clear schedule + lateness
    RM_ClearTables(true, true);

    RM_UpdateTasksTable();
});

RM_AddTask_Form.addEventListener('submit', (e) => {
    // Prevent normal submission of form
    e.preventDefault();
    // Get the form data
    const formData = new FormData(e.target);
    // Add the task to array
    RM_Tasks.push({"ct": parseFloat(formData.get('RM_computationTime')), "period": parseFloat(formData.get('RM_period'))})
    // Clear form fields
    RM_AddTask_Form.reset();
    // Refresh the table
    RM_UpdateTasksTable();
});

RM_Schedule_Button.addEventListener("click", (e) => {
    // Update Schedule
    RM_UpdateSchedule();
});


function RM_RemoveTask(idx) {
    // Remove specific row
    RM_Tasks.splice(idx, 1);
    // Refresh the table
    RM_UpdateTasksTable();
}

RM_ClearTasks_Button.addEventListener("click", (e) => {
    // Clear Tasks
    RM_Tasks = [];
    // Refresh the table
    RM_UpdateTasksTable();
});

function RM_UpdateTasksTable() {
    // Clear tasks
    RM_ClearTables(true, true);

    // Find Minor Cycle
    minorCycle = RM_Tasks.reduce((prev, curr) => prev.period < curr.period ? prev : curr).period;
    // Find Major Cycle
    majorCycle = RM_Tasks.reduce((prev, curr) => prev.period > curr.period ? prev : curr).period;

    // Calc Task Ui = Ci/Ti
    RM_Tasks.forEach((t) => t["ui"] = t.ct / t.period);

    // Feasibility
    var Feasibility_Num = RM_Tasks.reduce( (total, curr) => {
        return total + curr.ui;
    }, 0);
    var processorUtilBound = RM_Tasks.length * (Math.pow(2, (1/RM_Tasks.length)) - 1);
    var Feasibility = Feasibility_Num <= processorUtilBound;

    // Add a new row for each task in the "RM_Tasks" array
    RM_Tasks.forEach((t, idx) => {
        var r = document.createElement("tr");

        var a = document.createElement("th");
        a.appendChild(document.createTextNode(`T${idx + 1}`));
        r.appendChild(a);

        var c = document.createElement("th");
        c.appendChild(document.createTextNode(t["ct"]));
        r.appendChild(c);

        var d = document.createElement("th");
        d.appendChild(document.createTextNode(t["period"]));
        r.appendChild(d);

        var e = document.createElement("th");
        e.appendChild(document.createTextNode(t["ui"].toFixed(2)));
        r.appendChild(e);

        var f = document.createElement("th");
        var f_button = document.createElement("button");
        f_button.appendChild(document.createTextNode("Delete"));
        f_button.classList.add("btn", "btn-danger");
        f_button.onclick = function () {
            RM_RemoveTask(idx);
        };
        f.appendChild(f_button);

        r.appendChild(f);
        RM_Tasks_Tbody.appendChild(r);
    });

    // Print Minor/Major Cycle Info
    var r = document.createElement("tr");
    var a = document.createElement("th");
    a.appendChild(document.createTextNode(`Minor Cycle: ${minorCycle}`));
    a.setAttribute("colspan", 5);
    r.appendChild(a);
    r.classList.add("table-info");
    r.setAttribute("align", "center");
    RM_Tasks_Tbody.appendChild(r);

    var r = document.createElement("tr");
    var a = document.createElement("th");
    a.appendChild(document.createTextNode(`Major Cycle: ${majorCycle}`));
    a.setAttribute("colspan", 5);
    r.appendChild(a);
    r.classList.add("table-info");
    r.setAttribute("align", "center");
    RM_Tasks_Tbody.appendChild(r);

    // Print Processor Upper Bound
    var r = document.createElement("tr");
    var a = document.createElement("th");
    a.appendChild(document.createTextNode(`Processor Utilization Factor Upper Bound: ${processorUtilBound.toFixed(2)}`));
    a.setAttribute("colspan", 5);
    r.appendChild(a);
    r.classList.add("table-info");
    r.setAttribute("align", "center");
    RM_Tasks_Tbody.appendChild(r);
    
    // Print Feasibility
    var r = document.createElement("tr");
    var a = document.createElement("th");
    a.setAttribute("colspan", 5);
    if (Feasibility) {
        a.appendChild(document.createTextNode(`This Task List IS Feasible. [Sum (Ci/Ti) <= N(2^1/N - 1) | ${Feasibility_Num.toFixed(2)} <= ${processorUtilBound.toFixed(2)}]`));
        r.classList.add("table-success");
    } else {
        a.appendChild(document.createTextNode(`This Task List is NOT Feasible. [Sum (Ci/Ti) <= N(2^1/N - 1) | ${Feasibility_Num.toFixed(2)} !<= ${processorUtilBound.toFixed(2)}]`));
        r.classList.add("table-danger");
    }
    r.appendChild(a);
    r.setAttribute("align", "center");
    RM_Tasks_Tbody.appendChild(r);
}

function gcdArray(input) {
    if (toString.call(input) !== "[object Array]")
        return false;
    var len, a, b;
    len = input.length;
    if (!len) {
        return null;
    }
    a = input[0];
    for (var i = 1; i < len; i++) {
        b = input[i];
        a = gcd(a, b);
    }
    return a;
}

function gcd(x, y) {
    if ((typeof x !== 'number') || (typeof y !== 'number'))
        return false;
    x = Math.abs(x);
    y = Math.abs(y);
    while (y) {
        var t = y;
        y = x % y;
        x = t;
    }
    return x;
}

function RM_UpdateSchedule() {
    // Clear schedule + lateness
    RM_ClearTables(false, true);
    var RM_New_Schedule = []

    if (!RM_Tasks.length > 0) {
        return;
    }

    var RM_Tasks_Sorted = Array.from(RM_Tasks);

    RM_Tasks_Sorted.forEach((t, idx) => {
        // Add Task# to each task before sorting
        t["t"] = idx + 1;
        // Add Computation time left
        t["ct_left"] = t["ct"];
    });

    console.log(`Ct of tasks: ${RM_Tasks_Sorted.map((t) => t.ct)}`)
    var timeIncrement = gcdArray(RM_Tasks_Sorted.map((t) => t.ct));

    var css_primary = 0;
    for (let i = 0; i < majorCycle; i += timeIncrement) {
        // change color for next task
        css_primary = i % minorCycle == 0 ? 0 : 1;     

        // If current time is the period for any of the tasks; then reset their ct_left
        RM_Tasks_Sorted.forEach((t) => {
            if (i % t.period == 0) {
                t.ct_left = t.ct;
            }
        });
        var incompleteTasks = RM_Tasks_Sorted.filter((t) => t.ct_left != 0);

        // Order Tasks By period Low -> High
        incompleteTasks.sort((a, b) => a.period - b.period);

        if (incompleteTasks.length > 0) {
            RM_New_Schedule.push({ "Time": i, "Task": `T${incompleteTasks[0].t}`, "css": css_primary ? "table-light" : "table-dark" })
            var currTask = RM_Tasks_Sorted.find( (t) => t.t == incompleteTasks[0].t);
            if (currTask.ct_left != 0) {
                currTask.ct_left -= timeIncrement;
            }
        } else {
            RM_New_Schedule.push({ "Time": i, "Task": `-`, "css": css_primary ? "table-light" : "table-dark" })
        }
    }

    RM_New_Schedule.forEach((s) => {
        var r = document.createElement("tr");
        r.classList.add(`${s.css}`);

        var a = document.createElement("th");
        a.appendChild(document.createTextNode(`${s.Time}`));
        r.appendChild(a);

        var b = document.createElement("th");
        b.appendChild(document.createTextNode(`${s.Task}`));
        r.appendChild(b);

        RM_Schedule_Tbody.appendChild(r);
    });
}

function RM_ClearTables(tasks, schedule) {
    if (tasks) {
        RM_Tasks_Tbody.innerHTML = "";
    }
    if (schedule) {
        RM_Schedule_Tbody.innerHTML = "";
    }
}