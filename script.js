//advance todo application


const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("priority");
const categorySelect = document.getElementById("category");
const dueDateInput = document.getElementById("dueDate");

const addTaskBtn = document.getElementById("addTask");

const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");

const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");

const themeBtn = document.getElementById("themeBtn");

const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

const toast = document.getElementById("toast");



let tasks = JSON.parse(localStorage.getItem("advancedTodo")) || [];

let filterMode = "all";

let searchText = "";

let draggedTask = null;


function saveTasks(){

    localStorage.setItem(
        "advancedTodo",
        JSON.stringify(tasks)
    );

}



function showToast(message){

    toast.innerHTML = message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}


const savedTheme = localStorage.getItem("theme");

if(savedTheme==="dark"){

    document.body.classList.add("dark");

    themeBtn.innerHTML =
    '<i class="fa-solid fa-sun"></i>';

}

themeBtn.onclick=()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

        themeBtn.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

    }

    else{

        localStorage.setItem("theme","light");

        themeBtn.innerHTML =
        '<i class="fa-solid fa-moon"></i>';

    }

};


function updateDashboard(){

    const total = tasks.length;

    const completed =
    tasks.filter(task=>task.completed).length;

    const pending =
    total-completed;

    totalTasks.innerHTML = total;

    completedTasks.innerHTML = completed;

    pendingTasks.innerHTML = pending;

    let progress = 0;

    if(total>0){

        progress = Math.round(
            (completed/total)*100
        );

    }

    progressFill.style.width =
    progress+"%";

    progressPercent.innerHTML =
    progress+"%";

}



function addTask(){

    const title =
    taskInput.value.trim();

    if(title===""){

        showToast("Please enter a task.");

        return;

    }

    const task={

        id:Date.now(),

        title:title,

        priority:prioritySelect.value,

        category:categorySelect.value,

        dueDate:dueDateInput.value,

        completed:false,

        createdAt:new Date().toLocaleString()

    };

    tasks.unshift(task);

    saveTasks();

    renderTasks();

    showToast("Task Added");

    taskInput.value="";

    dueDateInput.value="";

    taskInput.focus();

}



addTaskBtn.addEventListener(
"click",
addTask
);

taskInput.addEventListener(
"keydown",
e=>{

if(e.key==="Enter"){

addTask();

}

});

searchInput.addEventListener(
"input",
()=>{

searchText=
searchInput.value.toLowerCase();

renderTasks();

});

filterSelect.addEventListener(
"change",
()=>{

filterMode=
filterSelect.value;

renderTasks();

});


function renderTasks(){

    taskList.innerHTML="";

    let filteredTasks=[...tasks];

  

    if(filterMode==="active"){

        filteredTasks=
        filteredTasks.filter(task=>!task.completed);

    }

    if(filterMode==="completed"){

        filteredTasks=
        filteredTasks.filter(task=>task.completed);

    }



    if(searchText!==""){

        filteredTasks=
        filteredTasks.filter(task=>

            task.title
            .toLowerCase()
            .includes(searchText)

        );

    }



    if(filteredTasks.length===0){

        taskList.innerHTML=`

        <div class="empty">

            <i class="fa-solid fa-box-open"></i>

            <h2>No Tasks Found</h2>

            <p>Add a new task to get started.</p>

        </div>

        `;

        updateDashboard();

        return;

    }

 

    filteredTasks.forEach(task=>{

        const li=document.createElement("li");

        li.className=
        task.completed
        ?"task completed"
        :"task";

        li.dataset.id=task.id;

        li.draggable=true;

        let priorityClass="medium";

        if(task.priority==="High"){

            priorityClass="high";

        }

        if(task.priority==="Low"){

            priorityClass="low";

        }

        li.innerHTML=`

        <div class="task-left">

            <input
                type="checkbox"
                ${task.completed?"checked":""}
                onchange="toggleTask(${task.id})"
            >

            <div class="task-info">

                <div class="task-title">

                    ${task.title}

                </div>

                <div class="task-meta">

                    <span class="badge ${priorityClass}">

                        ${task.priority}

                    </span>

                    <span class="badge category">

                        ${task.category}

                    </span>

                    ${
                        task.dueDate
                        ?

                        `<span class="badge due">

                            ${task.dueDate}

                        </span>`

                        :

                        ""

                    }

                </div>

                <small>

                    Created :

                    ${task.createdAt}

                </small>

            </div>

        </div>

        <div class="task-actions">

            <button

                class="edit-btn"

                onclick="editTask(${task.id})"

                title="Edit"

            >

                <i class="fa-solid fa-pen"></i>

            </button>

            <button

                class="delete-btn"

                onclick="deleteTask(${task.id})"

                title="Delete"

            >

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

        `;

        taskList.appendChild(li);

    });

    updateDashboard();

    initializeDragDrop();

}



renderTasks();

--

function toggleTask(id){

    const task = tasks.find(task => task.id === id);

    if(!task) return;

    task.completed = !task.completed;

    saveTasks();

    renderTasks();

    showToast(
        task.completed
        ? "Task Completed ✅"
        : "Task Marked Active"
    );

}

// ----------------------------
// DELETE TASK
// ----------------------------

function deleteTask(id){

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if(!confirmDelete) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();

    showToast("Task Deleted");

}

// ----------------------------
// EDIT TASK
// ----------------------------

function editTask(id){

    const task = tasks.find(task => task.id === id);

    if(!task) return;

    const newTitle = prompt(
        "Edit Task",
        task.title
    );

    if(newTitle === null) return;

    const updatedTitle = newTitle.trim();

    if(updatedTitle === ""){

        showToast("Task title cannot be empty.");

        return;

    }

    task.title = updatedTitle;

    saveTasks();

    renderTasks();

    showToast("Task Updated");

}

// ----------------------------
// SORT TASKS
// ----------------------------

function sortTasks(){

    const priorityOrder = {

        High:1,
        Medium:2,
        Low:3

    };

    tasks.sort((a,b)=>{

        if(priorityOrder[a.priority] !== priorityOrder[b.priority]){

            return priorityOrder[a.priority] -
                   priorityOrder[b.priority];

        }

        return a.id - b.id;
    });

    saveTasks();

    renderTasks();

}

// ----------------------------
// GLOBAL FUNCTIONS
// ----------------------------

window.toggleTask = toggleTask;

window.deleteTask = deleteTask;

window.editTask = editTask;

// ----------------------------
// KEYBOARD SHORTCUTS
// ----------------------------

document.addEventListener("keydown",e=>{

    // Ctrl + F
    if(e.ctrlKey && e.key==="f"){

        e.preventDefault();

        searchInput.focus();

    }

    // Escape

    if(e.key==="Escape"){

        searchInput.value="";

        searchText="";

        renderTasks();

    }

});
/* ===========================================
   ADVANCED TODO APP
   script.js (Part 4)
===========================================*/

// ----------------------------
// DRAG & DROP
// ----------------------------

function initializeDragDrop() {

    const items = document.querySelectorAll(".task");

    items.forEach(item => {

        item.addEventListener("dragstart", dragStart);
        item.addEventListener("dragover", dragOver);
        item.addEventListener("drop", dropItem);
        item.addEventListener("dragend", dragEnd);

    });

}

function dragStart(e){

    draggedTask = this;

    this.classList.add("dragging");

}

function dragOver(e){

    e.preventDefault();

}

function dropItem(e){

    e.preventDefault();

    if(draggedTask===this) return;

    const fromId = Number(draggedTask.dataset.id);

    const toId = Number(this.dataset.id);

    const fromIndex = tasks.findIndex(
        task=>task.id===fromId
    );

    const toIndex = tasks.findIndex(
        task=>task.id===toId
    );

    if(fromIndex===-1 || toIndex===-1) return;

    const movedTask = tasks.splice(fromIndex,1)[0];

    tasks.splice(toIndex,0,movedTask);

    saveTasks();

    renderTasks();

    showToast("Tasks Reordered");

}

function dragEnd(){

    this.classList.remove("dragging");

}

// ----------------------------
// EXPORT JSON
// ----------------------------

exportBtn.addEventListener("click",()=>{

    const json = JSON.stringify(tasks,null,2);

    const blob = new Blob(
        [json],
        {type:"application/json"}
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "advanced-todo-backup.json";

    a.click();

    URL.revokeObjectURL(url);

    showToast("Tasks Exported");

});

// ----------------------------
// IMPORT JSON
// ----------------------------

importFile.addEventListener("change",(e)=>{

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(event){

        try{

            const imported =
                JSON.parse(event.target.result);

            if(!Array.isArray(imported)){

                throw new Error();

            }

            tasks = imported;

            saveTasks();

            renderTasks();

            showToast("Tasks Imported");

        }

        catch{

            showToast("Invalid JSON File");

        }

    };

    reader.readAsText(file);

});

// ----------------------------
// AUTO SORT HIGH PRIORITY
// ----------------------------

function autoSortByPriority(){

    const order={

        High:1,

        Medium:2,

        Low:3

    };

    tasks.sort((a,b)=>{

        return order[a.priority]-order[b.priority];

    });

}

// ----------------------------
// INITIALIZE APP
// ----------------------------

autoSortByPriority();

renderTasks();

updateDashboard();

showToast("Advanced To-Do Loaded");