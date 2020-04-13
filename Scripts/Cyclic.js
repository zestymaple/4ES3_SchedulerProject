var Cyclic_Tasks = [];
var minorCycle = 0;
var majorCycle = 0;

var Cyclic_AddTask_Form = document.getElementById('Cyclic_AddTask');
var Cyclic_Tasks_Tbody = document.getElementById('Cyclic_Tasks');
var Cyclic_ClearTasks_Button = document.getElementById('Cyclic_ClearTasks');

var Cyclic_Schedule_Button = document.getElementById('Cyclic_calcSchedule');
var Cyclic_Schedule_Tbody = document.getElementById('Cyclic_Schedule');


window.addEventListener('load', (e) => {
    // Clear form fields
    Cyclic_AddTask_Form.reset();
    // Clear schedule + lateness
    Cyclic_ClearTables(true, true);

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
    Cyclic_ClearTables(true, true);

    // Find Minor Cycle
    minorCycle = Cyclic_Tasks.reduce((prev, curr) => prev.period < curr.period ? prev : curr).period;
    // Find Major Cycle
    majorCycle = Cyclic_Tasks.reduce((prev, curr) => prev.period > curr.period ? prev : curr).period;

    // Feasibility
    var Feasibility_Num = Cyclic_Tasks.reduce( (total, curr) => {
        return total + (curr.ct/curr.period);
    }, 0);
    var Feasibility = Feasibility_Num <= 1;    

    // Add a new row for each task in the "Cyclic_Tasks" array
    Cyclic_Tasks.forEach((t, idx) => {
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

        var ctFitMinorCycle = t["period"] % minorCycle == 0;
        var e = document.createElement("th");
        e.appendChild(document.createTextNode(ctFitMinorCycle));
        if (!ctFitMinorCycle) {
            e.classList.add("table-danger");
        }
        r.appendChild(e);

        var f = document.createElement("th");
        var f_button = document.createElement("button");
        f_button.appendChild(document.createTextNode("Delete"));
        f_button.classList.add("btn", "btn-danger");
        f_button.onclick = function () {
            Cyclic_RemoveTask(idx);
        };
        f.appendChild(f_button);

        r.appendChild(f);
        Cyclic_Tasks_Tbody.appendChild(r);
    });

    // Print Minor/Major Cycle Info
    var r = document.createElement("tr");
    var a = document.createElement("th");
    a.appendChild(document.createTextNode(`Minor Cycle: ${minorCycle}`));
    a.setAttribute("colspan", 5);
    r.appendChild(a);
    r.classList.add("table-info");
    r.setAttribute("align", "center");
    Cyclic_Tasks_Tbody.appendChild(r);

    var r = document.createElement("tr");
    var a = document.createElement("th");
    a.appendChild(document.createTextNode(`Major Cycle: ${majorCycle}`));
    a.setAttribute("colspan", 5);
    r.appendChild(a);
    r.classList.add("table-info");
    r.setAttribute("align", "center");
    Cyclic_Tasks_Tbody.appendChild(r);
    
    // Print Feasibility
    var r = document.createElement("tr");
    var a = document.createElement("th");
    a.setAttribute("colspan", 5);
    if (Feasibility) {
        a.appendChild(document.createTextNode(`This Task List IS Feasible. [Sum (Ci/Ti) <= 1 | ${Feasibility_Num.toFixed(2)} <= 1]`));
        r.classList.add("table-success");
    } else {
        a.appendChild(document.createTextNode(`This Task List is NOT Feasible. [Sum (Ci/Ti) <= 1 | ${Feasibility_Num.toFixed(2)} !<= 1]`));
        r.classList.add("table-danger");
    }
    r.appendChild(a);
    r.setAttribute("align", "center");
    Cyclic_Tasks_Tbody.appendChild(r);
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

function Cyclic_UpdateSchedule() {
    // Clear schedule + lateness
    Cyclic_ClearTables(false, true);
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

    console.log(`Ct of tasks: ${Cyclic_Tasks_Sorted.map((t) => t.ct)}`)
    var timeIncrement = gcdArray(Cyclic_Tasks_Sorted.map((t) => t.ct));

    var css_primary = 0;
    for (let i = 0; i < majorCycle; i += minorCycle) {
        // For Each Minor Cycle Decide What Tasks Run
        // Order Tasks By Period Low -> High
        Cyclic_Tasks_Sorted.sort((a, b) => a.period - b.period);

        // If current time is the period for any of the tasks; then reset their
        Cyclic_Tasks_Sorted.forEach((t) => {
            if (i % t.period == 0) {
                t.ct_left = t.ct;
            }
        });
        

        for (let v = i; v < (i + minorCycle); v += timeIncrement) {

            var incompleteTasks = Cyclic_Tasks_Sorted.filter((t) => t.ct_left != 0);

            if (incompleteTasks.length > 0) {
                Cyclic_New_Schedule.push({ "Time": v, "Task": `T${incompleteTasks[0].t}`, "css": css_primary ? "table-light" : "table-dark" })
                var currTask = Cyclic_Tasks_Sorted.find( (t) => t.t == incompleteTasks[0].t);
                if (currTask.ct_left != 0) {
                    currTask.ct_left -= timeIncrement;
                }
            } else {
                Cyclic_New_Schedule.push({ "Time": v, "Task": `-`, "css": css_primary ? "table-light" : "table-dark" })
            }

            // incompleteTasks.forEach((task) => {
            //     // if (task.ct_left != 0) {
            //     // }
    
            // });

        }

        // change color for next task
        css_primary = css_primary ? 0 : 1;
    }

    Cyclic_New_Schedule.forEach((s) => {
        var r = document.createElement("tr");
        r.classList.add(`${s.css}`);

        var a = document.createElement("th");
        a.appendChild(document.createTextNode(`${s.Time}`));
        r.appendChild(a);

        var b = document.createElement("th");
        b.appendChild(document.createTextNode(`${s.Task}`));
        r.appendChild(b);

        Cyclic_Schedule_Tbody.appendChild(r);
    });
}

function Cyclic_ClearTables(tasks, schedule) {
    if (tasks) {
        Cyclic_Tasks_Tbody.innerHTML = "";
    }
    if (schedule) {
        Cyclic_Schedule_Tbody.innerHTML = "";
    }
}