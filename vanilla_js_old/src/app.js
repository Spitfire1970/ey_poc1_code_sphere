
const files = [
    { name: 'index.html', content: '<h1>Hello, World!</h1>', type: 'html' },
    { name: 'styles.css', content: 'body { background-color: #f0f0f0; }', type: 'css' },
    { name: 'script.js', content: 'console.log("Hello, World!");', type: 'js' },
  ];
const folders = ['src', 'public', 'styles'];

let activeFile = null;
let openFiles = [];

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

function switchFile(index) {
  if (activeFile !== null && openFiles[activeFile].content !== document.getElementById('code-area').value) {
    openFiles[activeFile].content = document.getElementById('code-area').value;
  }

  activeFile = index;
  document.getElementById('code-area').value = openFiles[activeFile].content;
  renderOpenFiles();
}

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

document.getElementById('add-file').addEventListener('click', addFile);

renderFolderStructure();
openFiles = files.slice(); 
activeFile = 0;
renderOpenFiles();
document.getElementById('code-area').value = openFiles[activeFile].content;

async function sendMessage() {
  const inputField = document.getElementById('chat-input');
  const messageText = inputField.value.trim();

  if (messageText !== '') {
    const messageContainer = document.getElementById('chat-messages');
    const userMessage = document.createElement('div');
    userMessage.textContent = 'You: ' + messageText;
    messageContainer.appendChild(userMessage);

    const context = [];
    openFiles.forEach(file => {
      const fileContext = {
        name: file.name,
        content: file.content,
        language: file.type
      };
      context.push(fileContext);
    });

    const response = await fetchResponseFromLanguageModel(context, messageText);

    const serverResponse = document.createElement('div');
    serverResponse.textContent = 'AI: ' + response;
    messageContainer.appendChild(serverResponse);

    inputField.value = '';
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
}

const chatForm = document.getElementById('chat-form');
chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await sendMessage();
});

async function fetchResponseFromLanguageModel(context, message) {
  const apiKey = 'API_KEY';
  const apiUrl = 'https://api.openai.com/v1/completions';

  const fileContext = context.map(file => `File: ${file.name} (${file.language})\n${file.content}\n`).join('\n');
  const prompt = `${fileContext}\nUser Message: ${message}\nAI Response:`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      prompt: prompt,
      model: 'gpt-3.5-turbo',
      max_tokens: 2048,
      temperature: 0.7,
      n: 1,
      stop: null
    })
  });

  const data = await response.json();
  console.log(data)
  return data.choices[0].text.trim();
}

function toggleChat() {
    const chatWindow = document.querySelector('.chat-window');
    chatWindow.classList.toggle('hidden');
  }

  
  const toggleChatButton = document.getElementById('toggle-chat');
  toggleChatButton.addEventListener('click', toggleChat);

function updateLineNumbers() {
    const codeArea = document.getElementById('code-area');
    const lineNumbers = document.querySelector('.line-numbers');
    const lines = codeArea.value.split('\n');
  
    let lineNumbersHtml = '';
    for (let i = 1; i <= lines.length; i++) {
      lineNumbersHtml += `<div>${i}</div>`;
    }
    lineNumbers.innerHTML = lineNumbersHtml;
  
    lineNumbers.scrollTop = codeArea.scrollTop;
  }
  
document.getElementById('code-area').addEventListener('input', updateLineNumbers);

document.getElementById('code-area').addEventListener('scroll', updateLineNumbers);

updateLineNumbers();