// Mock data for files and folders
const files = [
    { name: 'index.html', content: '<h1>Hello, World!</h1>', type: 'html' },
    { name: 'styles.css', content: 'body { background-color: #f0f0f0; }', type: 'css' },
    { name: 'script.js', content: 'console.log("Hello, World!");', type: 'js' },
  ];
  const folders = ['src', 'public', 'styles'];
  
  // Global variables
  let activeFile = null;
  let openFiles = [];
  
  // Function to render folder structure in the sidebar
  function renderFolderStructure() {
    const explorerList = document.getElementById('explorer-list');
    explorerList.innerHTML = '';
  
    folders.forEach(folder => {
      const li = document.createElement('li');
      const icon = document.createElement('i');
      icon.classList.add('fas', 'fa-folder');
      li.appendChild(icon);
      li.appendChild(document.createTextNode(folder));
      explorerList.appendChild(li);
    });
  }
  
  // Function to render open files in the tab bar
  function renderOpenFiles() {
    const openFilesTabsContainer = document.getElementById('open-files-tabs');
    openFilesTabsContainer.innerHTML = '';
  
    openFiles.forEach((file, index) => {
      const li = document.createElement('li');
      li.textContent = file.name;
      li.addEventListener('click', () => switchFile(index));
      if (index === activeFile) {
        li.classList.add('active');
      }
      openFilesTabsContainer.appendChild(li);
    });
  }
  
  // Function to switch the active file
  function switchFile(index) {
    if (activeFile !== null && openFiles[activeFile].content !== document.getElementById('code-area').value) {
      openFiles[activeFile].content = document.getElementById('code-area').value;
    }
  
    activeFile = index;
    document.getElementById('code-area').value = openFiles[activeFile].content;
    renderOpenFiles();
  }
  
  // Function to add a new file
  function addFile() {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const extension = fileName.split('.').pop();
      const type = extension === 'html' ? 'html' : extension === 'css' ? 'css' : 'js';
      const newFile = { name: fileName, content: '', type };
      openFiles.push(newFile);
      activeFile = openFiles.length - 1;
      document.getElementById('code-area').value = '';
      renderOpenFiles();
    }
  }
  
  // Event listener for the "Add File" button
  document.getElementById('add-file').addEventListener('click', addFile);
  
  // Render folder structure and open files when the page loads
  renderFolderStructure();
  openFiles = files.slice(); // Clone the initial files array
  activeFile = 0;
  renderOpenFiles();
  document.getElementById('code-area').value = openFiles[activeFile].content;

  // Function to send a message to the chat
function sendMessage() {
    const inputField = document.getElementById('chat-input');
    const messageText = inputField.value.trim();
  
    if (messageText !== '') {
      const messageContainer = document.getElementById('chat-messages');
      const userMessage = document.createElement('div');
      userMessage.textContent = 'You: ' + messageText;
      messageContainer.appendChild(userMessage);
  
      // Placeholder for server response
      const serverResponse = document.createElement('div');
      serverResponse.textContent = 'Server: This is a placeholder response.';
      messageContainer.appendChild(serverResponse);
  
      inputField.value = '';
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }
  
  // Event listener for chat form submission
  const chatForm = document.getElementById('chat-form');
  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage();
  });

// Function to toggle the chat window
function toggleChat() {
    const chatWindow = document.querySelector('.chat-window');
    chatWindow.classList.toggle('hidden');
  }

  
  // Event listener for toggle chat button
  const toggleChatButton = document.getElementById('toggle-chat');
  toggleChatButton.addEventListener('click', toggleChat);

// Function to update line numbers
function updateLineNumbers() {
    const codeArea = document.getElementById('code-area');
    const lineNumbers = document.querySelector('.line-numbers');
    const lines = codeArea.value.split('\n');
  
    let lineNumbersHtml = '';
    for (let i = 1; i <= lines.length; i++) {
      lineNumbersHtml += `<div>${i}</div>`;
    }
    lineNumbers.innerHTML = lineNumbersHtml;
  
    // Sync line numbers scroll position
    lineNumbers.scrollTop = codeArea.scrollTop;
  }
  
  // Event listener for code area changes
  document.getElementById('code-area').addEventListener('input', updateLineNumbers);
  
  // Event listener for code area scroll
  document.getElementById('code-area').addEventListener('scroll', updateLineNumbers);
  
  // Update line numbers when the page loads
  updateLineNumbers();