
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];

const listContainer = document.getElementById('listContainer');
const form = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskCategory = document.getElementById('task-category');
const taskDate = document.getElementById('task-date');
const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');



function myLocalStorage() {

    localStorage.setItem('tasks', JSON.stringify(tasks));
}
function updateTimer(dueDate, timerElement) {
    const currentDate = new Date();
    const taskDueDate = new Date(dueDate);

    const timeDiff = taskDueDate - currentDate;
    const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (timeDiff > 0) {
        timerElement.textContent = `Time left: ${daysLeft}d ${hoursLeft}h ${minutesLeft}m`;
    } else {
        timerElement.textContent = 'Task overdue';
    }
}

function createFlashCard(taskData) {

    if (taskData.userEmail === loggedInUserEmail) {


        const flashCard = document.createElement('div');

        flashCard.className = 'flash-card';


        if (taskData.completed) {

            flashCard.classList.add('completed');
        }


        const currentDate = new Date();

        const taskDate = new Date(taskData.date);

        if (taskDate.toDateString() === currentDate.toDateString()) {
            flashCard.classList.add("flashcard");
        } else if (taskDate < currentDate) {
            flashCard.classList.add("overdue");
        }



        flashCard.innerHTML = `
                            <!-- accessing the input of the taskData and displaying it -->
                            <h3>${taskData.task}</h3>

                            <!-- accessing the category of the taskData and displaying it -->
                            <p class="category">Category: ${taskData.category}</p>

                            <!-- this for completion status -->
                            <p class="status">${taskData.completed ? 'Status: Completed' : 'Status: Pending'}</p>

                            <!-- this is for date -->
                            <p class="date">Date: ${taskData.date}</p>
                            <p class="timer"></p>
                            <div class="btn-container">
                                <button class="btn-delete">Delete</button>  
                                <button class="btn-edit">Edit</button>
                                <button class="btn-complete">${taskData.completed ? 'Undo' : 'Complete'}</button>
                            </div>
                        `;


        listContainer.appendChild(flashCard);



        const timerElement = flashCard.querySelector('.timer');
        updateTimer(taskData.date, timerElement);

        const deleteButton = flashCard.querySelector('.btn-delete');
        const editButton = flashCard.querySelector('.btn-edit');
        const completeButton = flashCard.querySelector('.btn-complete');


        completeButton.addEventListener('click', () => {

            taskData.completed = !taskData.completed;
            flashCard.querySelector('.status').textContent = taskData.completed ? 'Status: Completed' : 'Status: Pending';
            completeButton.textContent = taskData.completed ? 'Undo' : 'Complete';
            flashCard.classList.toggle('completed', taskData.completed);
            myLocalStorage();
        });


        editButton.addEventListener('click', () => {
            const editDialog = document.getElementById('edit-dialog');
            const editForm = document.getElementById('edit-form');
            const editTaskInput = document.getElementById('edit-task-input');
            const editTaskCategory = document.getElementById('edit-task-category');
            const editTaskDate = document.getElementById('edit-task-date');
            const cancelEditButton = document.getElementById('cancel-edit');

            editTaskInput.value = taskData.task;
            editTaskCategory.value = taskData.category;
            editTaskDate.value = taskData.date;

            editDialog.showModal();

            editForm.addEventListener('submit', (event) => {
                event.preventDefault();

                taskData.task = editTaskInput.value;
                taskData.category = editTaskCategory.value;
                taskData.date = editTaskDate.value;

                flashCard.querySelector('h3').textContent = taskData.task;
                flashCard.querySelector('.category').textContent = `Category: ${taskData.category}`;
                flashCard.querySelector('.date').textContent = `Date: ${taskData.date}`;

                myLocalStorage();
                editDialog.close();
            });
            cancelEditButton.addEventListener('click', () => {
                editDialog.close();
            });
        });


        deleteButton.addEventListener('click', () => {
            listContainer.removeChild(flashCard);
            const taskIndex = tasks.findIndex(taskDataItem => taskDataItem.task === taskData.task);


            if (taskIndex !== -1) {
                tasks.splice(taskIndex, 1);
                myLocalStorage();
            }
        });
    }
}


tasks.forEach(taskData => createFlashCard(taskData));

form.addEventListener('submit', function (event) {

    event.preventDefault();

    const task = taskInput.value;
    const category = taskCategory.value;
    const date = new Date(taskDate.value);
    const formattedDate = date.toISOString().slice(0, 10);

    if (task.trim() !== '') {

        const taskData = {
            task,
            category,
            date: formattedDate,
            completed: false,
            userEmail: loggedInUserEmail
        };

        createFlashCard(taskData);

        taskInput.value = '';
        taskCategory.value = '';
        taskDate.value = '';

        tasks.push(taskData);
        myLocalStorage();

        const taskList = document.querySelector('.task-list');
        taskList.classList.add('tasks-added');
    }
});


const sortButton = document.getElementById('sort-btn');
sortButton.addEventListener('click', sortTasksByDate);

function sortTasksByDate() {
    tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    listContainer.innerHTML = '';
    tasks.forEach(taskData => createFlashCard(taskData));

}


const voiceButton = document.getElementById('voice-button');
const searchInput = document.getElementById('search-input');

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        console.log('Voice recognition started');
    };

    recognition.onend = () => {
        console.log('Voice recognition ended');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        performSearch();
    };

    voiceButton.addEventListener('click', () => {
        recognition.start();
    });
} else {
    voiceButton.disabled = true;
    voiceButton.textContent = '[Search] -> No';
}

searchInput.addEventListener('input', event => {
    const searchText = event.target.value;
    performSearch(searchText);
});

function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm === '') {
        listContainer.innerHTML = '';
        tasks.forEach(taskData => createFlashCard(taskData));
    } else {
        const filteredTasks = tasks.filter(taskData => taskData.task.toLowerCase().includes(searchTerm));

        listContainer.innerHTML = '';

        if (filteredTasks.length === 0) {
            listContainer.innerHTML = '<p>No matching tasks found.</p>';
        } else {
            filteredTasks.forEach(taskData => createFlashCard(taskData));
        }
    }
}

searchInput.addEventListener('input', function () {
    if (searchInput.value.trim() === '') {
        listContainer.innerHTML = '';
        tasks.forEach(taskData => createFlashCard(taskData));
    }
});

const categoryFilter = document.getElementById('category-filter');
categoryFilter.addEventListener('change', filterTasksByCategory);

function filterTasksByCategory() {
    const selectedCategory = categoryFilter.value;

    listContainer.innerHTML = '';
    if (selectedCategory === 'all') {
        tasks.forEach(taskData => createFlashCard(taskData));
    } else {
        const filteredTasks = tasks.filter(taskData => taskData.category === selectedCategory);
        if (filteredTasks.length === 0) {
            listContainer.innerHTML = '<p>No tasks found in this category.</p>';
        } else {
            filteredTasks.forEach(taskData => createFlashCard(taskData));
        }
    }
}

const searchIcon = document.getElementById('search-icon');
searchIcon.addEventListener('click', () => {
    searchInput.toggleAttribute('hidden');
    searchInput.classList.toggle('transitioned');


    if (!searchInput.hasAttribute('hidden')) {
        searchInput.focus();
    }
});


const addTaskButton = document.getElementById('add-task-button');
const addTaskDialog = document.getElementById('add-task-dialog');
const addTaskForm = document.getElementById('task-form');
const addTaskInput = document.getElementById('task-input');
const addTaskCategory = document.getElementById('task-category');
const addTaskDate = document.getElementById('task-date');
const cancelAddTaskButton = document.getElementById('cancel-add-task');

// Function to open the "Add Task" dialog
function openAddTaskDialog() {
    addTaskDialog.showModal();
}

// Function to close the "Add Task" dialog
function closeAddTaskDialog() {
    addTaskDialog.close();
    // Clear the input fields
    addTaskInput.value = '';
    addTaskCategory.value = '';
    addTaskDate.value = '';
}

addTaskButton.addEventListener('click', openAddTaskDialog);
cancelAddTaskButton.addEventListener('click', closeAddTaskDialog);

// Handle the form submission to add a task
addTaskForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const task = addTaskInput.value;
    const category = addTaskCategory.value;
    const date = addTaskDate.value;

    // Check if the task input is not empty
    if (task.trim() !== '') {
        const taskData = {
            task,
            category,
            date,
            completed: false,
            userEmail: loggedInUserEmail,
        };

        createFlashCard(taskData);

        tasks.push(taskData);
        myLocalStorage();

        closeAddTaskDialog();
        // Clear the input fields
        addTaskInput.value = '';
        addTaskCategory.value = '';
        addTaskDate.value = '';
    }
});



// Initialize counters
let completedCount = 0;
let pendingCount = 0;
let totalTasks = 0;

// Iterate through tasks and count based on status
tasks.forEach(task => {
    if (task.completed === true && task.userEmail === loggedInUserEmail) {
        completedCount++;
        totalTasks++;

    } else if (task.completed === false && task.userEmail === loggedInUserEmail) {
        pendingCount++;
        totalTasks++;
    }
});


// Calculate the percentages
document.getElementById('total-task-count').innerHTML = totalTasks;
document.getElementById('completed-task-count').innerHTML = completedCount;
document.getElementById('pending-task-count').innerHTML = pendingCount;
const completedPercentage = (completedCount/totalTasks)*100;
const pendingPercentage = (pendingCount/totalTasks)*100;


// Create the doughnut chart
const ctx = document.getElementById('doughnutChart').getContext('2d');
new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Completed', 'Pending'],
        datasets: [
            {
                data: [completedPercentage, pendingPercentage],
                backgroundColor: ['#00203FFF', '#ADEFD1'], // You can customize the colors
            },
        ],
    },
    options: {
        responsive: true,
        cutoutPercentage: 70, 
        legend: {
            display: true,
            position: 'bottom',
        },
        animation: {
            animateScale: true,
            animateRotate: true,
        },
    },
});


const svgFiles = [ '2ndvector.svg', '3rdvector.svg', '4thvector.svg', '5thvector.svg'];
const svgObject = document.getElementById('svgObject');
let currentIndex = 0;

function changeSVG() {
    if (currentIndex >= svgFiles.length) {
        currentIndex = 0;
    }
    const currentSVG = svgFiles[currentIndex];
    svgObject.data = currentSVG;
    currentIndex++;
}
setInterval(changeSVG, 2000); 


