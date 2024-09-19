import React, { useEffect, useState,useCallback } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";
import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropdown";
import ChatBot from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';

const javascriptDefault = `/**
* Problem: Binary Search: Search a sorted array for a target value.
*/

// Time: O(log n)
const binarySearch = (arr, target) => {
 return binarySearchHelper(arr, target, 0, arr.length - 1);
};

const binarySearchHelper = (arr, target, start, end) => {
 if (start > end) {
   return false;
 }
 let mid = Math.floor((start + end) / 2);
 if (arr[mid] === target) {
   return mid;
 }
 if (arr[mid] < target) {
   return binarySearchHelper(arr, target, mid + 1, end);
 }
 if (arr[mid] > target) {
   return binarySearchHelper(arr, target, start, mid - 1);
 }
};

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const target = 5;
console.log(binarySearch(arr, target));
`;

const Landing = () => {
  const [code, setCode] = useState(javascriptDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [theme, setTheme] = useState("Cobolt");
  const [language, setLanguage] = useState(languageOptions[0]);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");
  useEffect(()=>{
    console.log("output details are",outputDetails);
  },[outputDetails])

  const handleRegenerate = async (error, code) => {
    console.log(code,error)
    try {
      const response = await axios.post("http://localhost:8000/regen/", {
        error,
        code,
      });
      setCode(response.data.response);
      return response.data.response;
    } catch (error) {
      console.error("Error fetching bot response:", error);
      return "Sorry, something went wrong. Please try again.";
    }
  };
  const handleRegenerateClick = () => {
    handleRegenerate(atob(outputDetails.stderr), code);
  };
  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
    console.log(language)
  };
  useEffect(() => {
    console.log("Updated language:", language);
  }, [language]);

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress]);
  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };

  const fetchBotResponse = async (user, lang, code) => {
    try {
      const response = await axios.post("http://localhost:8000/chat/", {
        user,
        lang,
        code,
      });
      return response.data.response;
    } catch (error) {
      console.error("Error fetching bot response:", error);
      return "Sorry, something went wrong. Please try again.";
    }
  };
  
  const ChatBotStep = ({ steps, triggerNextStep }) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState('');
    const user = steps[2].value;

    const getBotResponse = useCallback(async () => {
      console.log(user, language.value, code);
      const res = await fetchBotResponse(user, language.value, code);
      console.log("Response from fetchBotResponse:", JSON.stringify(res));
      setResponse(res);
      setCode(res);
      setLoading(false);
      triggerNextStep({ value: res });
    }, [language.value, code]);

    useEffect(() => {
      getBotResponse();
    }, [getBotResponse]);

    if (loading) {
      return <div>Loading...</div>;
    }
    return <div>{response}</div>;
  };

  const renderChatBotStep = (props) => (
    <ChatBotStep {...props} />
  );
  
  const steps = [
    { id: '0', message: 'Hey!', trigger: '1' },
    { id: '1', message: "How can I help you?", trigger: '2' },
    { id: '2', user: true, trigger: 'fetchBotResponse' },
    {
      id: 'fetchBotResponse',
      component: <ChatBotStep setCode={setCode} currentCode={code} currentLanguage={language}/>,
      waitAction: true,
      trigger: '1', // This will allow for infinite conversation
    },
  ];
  
  useEffect(() => {
    console.log("Code state updated:", code);
  }, [code]);
 
// Creating our own theme
const chat_theme = {
    background: '#0D1021',
    headerBgColor: '#f6e51c',
    headerFontSize: '20px',
    botBubbleColor: '#0F3789',
    headerFontColor: 'black',
    botFontColor: 'white',
    userBubbleColor: '#0F3789',
    userFontColor: 'white',
};
 
// Set some properties of the bot
const config = {
    botAvatar: "bot_photo.png",
    floating: true,
};

  const handleCompile = () => {
    setProcessing(true);
    const formData = {
      language_id: language.id,
      // encode source code in base64
      source_code: btoa(code),
      stdin: btoa(customInput),
    };
    const options = {
      method: "POST",
      //url: process.env.REACT_APP_RAPID_API_URL,
      url: 'https://judge0-ce.p.rapidapi.com/submissions',
      params: { base64_encoded: "true", fields: "*" },
  headers: {
    'x-rapidapi-key': '2553ed6019mshb852c1f1310fbecp1d3165jsne595ddc0fd16',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
      data: formData,
    };

    axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err.response.status;
        console.log("status", status);
        if (status === 429) {
          console.log("too many requests", status);

          showErrorToast(
            `Quota of 100 requests exceeded for the Day! Please read the blog on freeCodeCamp to learn how to setup your own RAPID API Judge0!`,
            10000
          );
        }
        setProcessing(false);
        console.log("catch block...", error);
      });
  };

  const checkStatus = async (token) => {
    const options = {
      method: 'GET',
        url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        headers: {
            'x-rapidapi-key': '2553ed6019mshb852c1f1310fbecp1d3165jsne595ddc0fd16',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        },
        params: {
            base64_encoded: "true",
            fields: "*"
        }
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        showSuccessToast(`Compiled Successfully!`);
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      showErrorToast();
    }
  };

  function handleThemeChange(th) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_) => setTheme(theme));
    }
  }
  useEffect(() => {
    defineTheme("blackboard").then((_) =>
      setTheme({ value: "blackboard", label: "Blackboard" })
    );
  }, []);

  const showSuccessToast = (msg) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const showErrorToast = (msg, timer) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: timer ? timer : 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* <div className="h-4 w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"></div> */}
      <div className="flex flex-row">
      <div className="px-4 py-2">
          <img src="ey_logo.png" height={50} width={100}/>
        </div>
        <div className="px-4 py-2">
          <LanguagesDropdown onSelectChange={onSelectChange} />
        </div>
        <div className="px-4 py-2">
          <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
        </div>
      </div>
      <div className="flex flex-row space-x-4 items-start px-4 py-4">
        <div className="flex flex-col w-full h-full justify-start items-end">
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme.value}
          />
        </div>

        <div className="right-container flex flex-shrink-0 w-[30%] flex-col">
          <OutputWindow outputDetails={outputDetails}
            handleRegenerate={handleRegenerate}
            setErrorOccurred={setErrorOccurred} />
          <div className="flex flex-col items-end">
          <ThemeProvider theme={chat_theme}>
                <ThemeProvider theme={chat_theme}>
  <ChatBot
    key={`${code}-${language.value}`}
    headerTitle="EYBot"
    steps={steps}
    {...config}
  />
</ThemeProvider>

            </ThemeProvider>
            <button
              onClick={handleCompile}
              disabled={!code}
              className={classnames(
                "mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_#f6e51c] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0",
                !code ? "opacity-50" : ""
              )}
            >
              {processing ? "Processing..." : "Compile and Execute"}
            </button>
            {errorOccurred && (
              <button
                onClick={handleRegenerateClick}
                className="mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_#f6e51c] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0"
              >
                Regenerate with AI
              </button>
            )}
          </div>
          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
    </>
  );
};
export default Landing;
