from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from hugchat import hugchat
from hugchat.login import Login
import re

app = FastAPI()

EMAIL = ""
PASSWD = ""
cookie_path_dir = "./cookies/"

# Login and get cookies
try:
    sign = Login(EMAIL, PASSWD)
    cookies = sign.login(cookie_dir_path=cookie_path_dir, save_cookies=True)
    chatbot = hugchat.ChatBot(cookies=cookies.get_dict())
except Exception as e:
    raise Exception(f"Failed to initialize chatbot: {e}")

class ChatRequest(BaseModel):
    user: str
    lang: str
    code: str

class ChatRegen(BaseModel):
    error: str
    code: str

# Add CORS middleware
origins = [
    "http://localhost:3000",  # React app running on localhost
    "http://localhost:8000",  # Backend API running on localhost
    # Add more origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow these origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

def extract_code_from_markdown(markdown_text):
    pattern = r'```(?:\w+)\n([\s\S]*?)```'
    
    matches = re.findall(pattern, markdown_text)
    
    if matches:
        return matches[0].strip()  # Strip to remove leading/trailing whitespace

    return None
@app.post("/chat/")
def chat(request: ChatRequest):
    try:
        print("processing",request.user,"code is",request.code,"language is",request.lang)
        prompt = f"In this {request.code} give {request.user} in {request.lang}"
        query_result = str(chatbot.query(prompt, web_search=True))
        print("done",query_result)
        query_result=extract_code_from_markdown(query_result)
        return {"response": query_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying chatbot: {e}")
    
@app.post("/regen/")
def chat(request: ChatRegen):
    try:
        print("processing",request.error,"code is",request.code)
        prompt = f"Fix the error {request.error} in this code {request.code}"
        query_result = str(chatbot.query(prompt, web_search=True))
        print("done",query_result)
        query_result=extract_code_from_markdown(query_result)
        return {"response": query_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying chatbot: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
